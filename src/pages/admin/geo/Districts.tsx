import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MapPin,
  Filter,
  Upload
} from 'lucide-react';
import { 
  getStates,
  getAllDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
  type State,
  type District
} from '@/lib/firestore';

const districtSchema = z.object({
  name: z.string().min(2, "District name must be at least 2 characters"),
  stateId: z.string().min(1, "Please select a state"),
});

type DistrictForm = z.infer<typeof districtSchema>;

export const Districts = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<DistrictForm>({
    resolver: zodResolver(districtSchema),
    defaultValues: {
      name: '',
      stateId: '',
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = districts;

    if (searchTerm) {
      filtered = filtered.filter(district => 
        district.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (stateFilter !== 'all') {
      filtered = filtered.filter(district => district.stateId === stateFilter);
    }

    setFilteredDistricts(filtered);
  }, [districts, searchTerm, stateFilter]);

  const fetchData = async () => {
    try {
      const [districtsData, statesData] = await Promise.all([
        getAllDistricts(),
        getStates()
      ]);
      setDistricts(districtsData);
      setFilteredDistricts(districtsData);
      setStates(statesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load districts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (district?: District) => {
    if (district) {
      setEditingDistrict(district);
      form.reset({
        name: district.name,
        stateId: district.stateId,
      });
    } else {
      setEditingDistrict(null);
      form.reset({
        name: '',
        stateId: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDistrict(null);
    form.reset();
  };

  const onSubmit = async (data: DistrictForm) => {
    setSubmitting(true);
    try {
      if (editingDistrict) {
        await updateDistrict(editingDistrict.id, data);
        toast({
          title: "District Updated",
          description: "District has been successfully updated.",
        });
      } else {
        await createDistrict(data);
        toast({
          title: "District Created",
          description: "District has been successfully created.",
        });
      }
      
      await fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving district:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save district.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDistrict = async (districtId: string) => {
    if (!confirm('Are you sure you want to delete this district? This will also delete all associated tehsils.')) {
      return;
    }

    try {
      await deleteDistrict(districtId);
      setDistricts(districts.filter(d => d.id !== districtId));
      toast({
        title: "District Deleted",
        description: "District has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting district:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete district.",
        variant: "destructive",
      });
    }
  };

  const getStateName = (stateId: string) => {
    const state = states.find(s => s.id === stateId);
    return state ? state.name : stateId;
  };

  const handleBulkImport = () => {
    toast({
      title: "Bulk Import",
      description: "Bulk import feature coming soon!",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Districts</h1>
            <p className="text-muted-foreground">Manage districts</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Districts</h1>
          <p className="text-muted-foreground">Manage districts by state</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBulkImport}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add District
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingDistrict ? 'Edit District' : 'Add New District'}
                </DialogTitle>
                <DialogDescription>
                  {editingDistrict 
                    ? 'Update the district details below.' 
                    : 'Create a new district.'
                  }
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="stateId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state.id} value={state.id}>
                                {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter district name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Saving..." : (editingDistrict ? "Update" : "Create")}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search districts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map((state) => (
                  <SelectItem key={state.id} value={state.id}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">
              Showing {filteredDistricts.length} of {districts.length} districts
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Districts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Districts List
          </CardTitle>
          <CardDescription>
            Manage districts by state
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Tehsils</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDistricts.map((district) => (
                  <TableRow key={district.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{district.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getStateName(district.stateId)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">0 tehsils</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOpenDialog(district)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteDistrict(district.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredDistricts.length === 0 && (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No districts found matching your criteria.</p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add First District
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};