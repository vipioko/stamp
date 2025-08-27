import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Trash2
} from 'lucide-react';

interface UploadResult {
  row: number;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

export const BulkUpload = () => {
  const [uploadType, setUploadType] = useState<'products' | 'districts' | 'tehsils'>('products');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid File Type",
          description: "Please select a CSV file.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setResults([]);
      setShowResults(false);
    }
  };

  const downloadTemplate = () => {
    let csvContent = '';
    let filename = '';

    switch (uploadType) {
      case 'products':
        csvContent = 'name,categoryId,stateId,amount,platformFee,expressFee,deliveryFee,deliveryTime\n';
        csvContent += 'Sample Product,category_id_here,state_id_here,1000,50,100,50,instant\n';
        filename = 'products_template.csv';
        break;
      case 'districts':
        csvContent = 'name,stateId\n';
        csvContent += 'Sample District,state_id_here\n';
        filename = 'districts_template.csv';
        break;
      case 'tehsils':
        csvContent = 'name,districtId\n';
        csvContent += 'Sample Tehsil,district_id_here\n';
        filename = 'tehsils_template.csv';
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  const validateRow = (row: string[], headers: string[], rowIndex: number): UploadResult => {
    const data: any = {};
    
    // Check if row has correct number of columns
    if (row.length !== headers.length) {
      return {
        row: rowIndex,
        status: 'error',
        message: `Expected ${headers.length} columns, got ${row.length}`,
      };
    }

    // Map row data to headers
    headers.forEach((header, index) => {
      data[header] = row[index];
    });

    // Validate based on upload type
    switch (uploadType) {
      case 'products':
        if (!data.name || data.name.length < 2) {
          return { row: rowIndex, status: 'error', message: 'Product name must be at least 2 characters' };
        }
        if (!data.amount || isNaN(Number(data.amount))) {
          return { row: rowIndex, status: 'error', message: 'Amount must be a valid number' };
        }
        if (!data.categoryId) {
          return { row: rowIndex, status: 'error', message: 'Category ID is required' };
        }
        if (!data.stateId) {
          return { row: rowIndex, status: 'error', message: 'State ID is required' };
        }
        break;
      case 'districts':
        if (!data.name || data.name.length < 2) {
          return { row: rowIndex, status: 'error', message: 'District name must be at least 2 characters' };
        }
        if (!data.stateId) {
          return { row: rowIndex, status: 'error', message: 'State ID is required' };
        }
        break;
      case 'tehsils':
        if (!data.name || data.name.length < 2) {
          return { row: rowIndex, status: 'error', message: 'Tehsil name must be at least 2 characters' };
        }
        if (!data.districtId) {
          return { row: rowIndex, status: 'error', message: 'District ID is required' };
        }
        break;
    }

    return {
      row: rowIndex,
      status: 'success',
      message: 'Valid row',
      data,
    };
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setResults([]);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length < 2) {
        toast({
          title: "Invalid File",
          description: "CSV file must contain at least a header row and one data row.",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);
      const uploadResults: UploadResult[] = [];

      // Validate all rows first
      for (let i = 0; i < dataRows.length; i++) {
        const result = validateRow(dataRows[i], headers, i + 2); // +2 because row 1 is header
        uploadResults.push(result);
        setProgress(((i + 1) / dataRows.length) * 50); // First 50% for validation
      }

      // Simulate upload process for valid rows
      const validRows = uploadResults.filter(r => r.status === 'success');
      
      for (let i = 0; i < validRows.length; i++) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Simulate some failures (10% chance)
        if (Math.random() < 0.1) {
          const index = uploadResults.findIndex(r => r === validRows[i]);
          uploadResults[index] = {
            ...validRows[i],
            status: 'error',
            message: 'Failed to save to database',
          };
        }
        
        setProgress(50 + ((i + 1) / validRows.length) * 50); // Second 50% for upload
      }

      setResults(uploadResults);
      setShowResults(true);

      const successCount = uploadResults.filter(r => r.status === 'success').length;
      const errorCount = uploadResults.filter(r => r.status === 'error').length;

      toast({
        title: "Upload Complete",
        description: `${successCount} records uploaded successfully, ${errorCount} failed.`,
        variant: successCount > 0 ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to process the CSV file.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const clearResults = () => {
    setResults([]);
    setShowResults(false);
    setFile(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-50 text-green-700 border-green-200',
      error: 'bg-red-50 text-red-700 border-red-200',
      warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    } as const;

    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk Upload</h1>
        <p className="text-muted-foreground">Upload multiple records using CSV files</p>
      </div>

      {/* Upload Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Configuration
          </CardTitle>
          <CardDescription>
            Select the type of data you want to upload and choose your CSV file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Upload Type</label>
              <Select value={uploadType} onValueChange={(value: any) => setUploadType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="products">Stamp Products</SelectItem>
                  <SelectItem value="districts">Districts</SelectItem>
                  <SelectItem value="tehsils">Tehsils</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">CSV File</label>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            
            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload CSV'}
            </Button>

            {showResults && (
              <Button variant="outline" onClick={clearResults}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Results
              </Button>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Make sure your CSV file follows the exact format shown in the template. 
              The first row should contain column headers, and all required fields must be filled.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 space-y-2 text-sm">
            <h4 className="font-medium">CSV Format Requirements:</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>First row must contain column headers</li>
              <li>Use commas to separate values</li>
              <li>Wrap text containing commas in double quotes</li>
              <li>All required fields must be provided</li>
              <li>IDs must reference existing records (states, districts, categories)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {showResults && results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Upload Results
            </CardTitle>
            <CardDescription>
              {results.filter(r => r.status === 'success').length} successful, {' '}
              {results.filter(r => r.status === 'error').length} failed, {' '}
              {results.filter(r => r.status === 'warning').length} warnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.row}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.status)}
                          {getStatusBadge(result.status)}
                        </div>
                      </TableCell>
                      <TableCell>{result.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};