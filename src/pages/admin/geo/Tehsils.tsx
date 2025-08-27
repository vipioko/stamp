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
  getAllTehsils,
  createTehsil,
  updateTehsil,
  deleteTehsil,
  type State,
  type District,
  type Tehsil
} from '@/lib/firestore';

const tehsilSchema = z.object({
  name: z.string().min(2, "Tehsil name must be at least 2 characters"),
  districtId: z.string().min(1, "Please select a district"),
});

type TehsilForm = z.infer<typeof tehsilSchema>;

export const Tehsils = () => {
  const [tehsils, setTehsils] = useState<Tehsil[]>([]);
  const [filteredTehsils, setFilteredTehsils] = useState<Tehsil[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTehsil, setEditingTehsil] = useState<Tehsil | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<TehsilForm>({
    resolver: zodResolver(tehsilSchema),
    defaultValues: {
      name: '',
      districtId: '',
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = tehsils;

    if (searchTerm) {
      filtered = filtered.filter(tehsil => 
        tehsil.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (districtFilter !== 'all') {
      filtered = filtered.filter(tehsil => tehsil.districtId === districtFilter);
    } else if (stateFilter !== 'all') {
      const stateDistricts = districts.filter(d => d.stateId === stateFilter);
      const stateDistrictIds = stateDistricts.map(d => d.id);
      filtered = filtered.filter(tehsil => stateDistrictIds.includes(tehsil.districtId));
    }

    setFilteredTehsils(filtered);
  }, [tehsils, searchTerm, stateFilter, districtFilter, districts]);

  useEffect(() => {
    if (stateFilter === 'all') {
      setFilteredDistricts(districts);
    } else {
      setFilteredDistricts(districts.filter(d => d.stateId === stateFilter));
    }
    setDistrictFilter('all');
  }, [stateFilter, districts]);

  const fetchData = async () => {
    try {
      const [tehsilsData, statesData, districtsData] = await Promise.all([
        getAllTehsils(),
        getStates(),
        getAllDistricts()
      ]);
      setTehsils(tehsilsData);
      setFilteredTehsils(tehsilsData);
      setStates(statesData);
      setDistricts(districtsData);
      setFilteredDistricts(districtsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load tehsils.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (tehsil?: Tehsil) => {
    if (tehsil) {
      setEditingTehsil(tehsil);
      form.reset({
        name: tehsil.name,
        districtId: tehsil.districtId,
      });
    } else {
      setEditingTehsil(null);
      form.reset({
        name: '',
        districtId: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTehsil(null);
    form.reset();
  };

  const onSubmit = async (data: TehsilForm) => {
    setSubmitting(true);
    try {
      if (editingTehsil) {
        await updateTehsil(editingTehsil.id, data);
        toast({
          title: "Tehsil Updated",
          description: "Tehsil has been successfully updated.",
        });
      } else {
        await createTehsil(data);
        toast({
          title: "Tehsil Created",
          description: "Tehsil has been successfully created.",
        });
      }
      
      await fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving tehsil:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save tehsil.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTehsil = async (tehsilId: string) => {
    if (!confirm('Are you sure you want to delete this tehsil?')) {
      return;
    }

    try {
      await deleteTehsil(tehsilId);
      setTehsils(tehsils.filter(t => t.id !== tehsilId));
      toast({
        title: "Tehsil Deleted",
        description: "Tehsil has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting tehsil:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete tehsil.",
        variant: "destructive",
      });
    }
  };

  const getDistrictName = (districtId: string) => {
    const district = districts.find(d => d.id === districtId);
    return district ? district.name : districtId;
  };

  const getStateName = (districtId: string) => {
    const district = districts.find(d => d.id === districtId);
    if (!district) return '';
    const state = states.find(s => s.id === district.stateId);
    return state ? state.name : '';
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
            <h1 className="text-3xl font-bold">Tehsils</h1>
            <p className="text-muted-foreground">Manage tehsils</p>
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
          <h1 className="text-3xl font-bold">Tehsils</h1>
          <p className="text-muted-foreground">Manage tehsils by district</p>
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
                Add Tehsil
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTehsil ? 'Edit Tehsil' : 'Add New Tehsil'}
                </DialogTitle>
                <DialogDescription>
                  {editingTehsil 
                    ? 'Update the tehsil details below.' 
                    : 'Create a new tehsil.'
                  }
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="districtId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select district" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {districts.map((district) => (
                              <SelectItem key={district.id} value={district.id}>
                                {district.name} ({getStateName(district.id)})
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
                        <FormLabel>Tehsil Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter tehsil name" />
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
                      {submitting ? "Saving..." : (editingTehsil ? "Update" : "Create")}
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tehsils..."
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

            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by district" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {filteredDistricts.map((district) => (
                  <SelectItem key={district.id} value={district.id}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">
              Showing {filteredTehsils.length} of {tehsils.length} tehsils
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tehsils Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Tehsils List
          </CardTitle>
          <CardDescription>
            Manage tehsils by district and state
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTehsils.map((tehsil) => (
                  <TableRow key={tehsil.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{tehsil.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getDistrictName(tehsil.districtId)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getStateName(tehsil.districtId)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOpenDialog(tehsil)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteTehsil(tehsil.id)}
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
          
          {filteredTehsils.length === 0 && (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No tehsils found matching your criteria.</p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Tehsil
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};