import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  createState,
  updateState,
  deleteState,
  type State
} from '@/lib/firestore';

const stateSchema = z.object({
  name: z.string().min(2, "State name must be at least 2 characters"),
  code: z.string().min(2, "State code must be at least 2 characters").max(3, "State code must be at most 3 characters"),
});

type StateForm = z.infer<typeof stateSchema>;

export const States = () => {
  const [states, setStates] = useState<State[]>([]);
  const [filteredStates, setFilteredStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingState, setEditingState] = useState<State | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<StateForm>({
    resolver: zodResolver(stateSchema),
    defaultValues: {
      name: '',
      code: '',
    },
  });

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    let filtered = states;

    if (searchTerm) {
      filtered = filtered.filter(state => 
        state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        state.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStates(filtered);
  }, [states, searchTerm]);

  const fetchStates = async () => {
    try {
      const statesData = await getStates();
      setStates(statesData);
      setFilteredStates(statesData);
    } catch (error) {
      console.error('Error fetching states:', error);
      toast({
        title: "Error",
        description: "Failed to load states.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (state?: State) => {
    if (state) {
      setEditingState(state);
      form.reset({
        name: state.name,
        code: state.code,
      });
    } else {
      setEditingState(null);
      form.reset({
        name: '',
        code: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingState(null);
    form.reset();
  };

  const onSubmit = async (data: StateForm) => {
    setSubmitting(true);
    try {
      if (editingState) {
        await updateState(editingState.id, data);
        toast({
          title: "State Updated",
          description: "State has been successfully updated.",
        });
      } else {
        await createState(data);
        toast({
          title: "State Created",
          description: "State has been successfully created.",
        });
      }
      
      await fetchStates();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving state:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save state.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteState = async (stateId: string) => {
    if (!confirm('Are you sure you want to delete this state? This will also delete all associated districts and tehsils.')) {
      return;
    }

    try {
      await deleteState(stateId);
      setStates(states.filter(s => s.id !== stateId));
      toast({
        title: "State Deleted",
        description: "State has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting state:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete state.",
        variant: "destructive",
      });
    }
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
            <h1 className="text-3xl font-bold">States</h1>
            <p className="text-muted-foreground">Manage states</p>
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
          <h1 className="text-3xl font-bold">States</h1>
          <p className="text-muted-foreground">Manage states and territories</p>
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
                Add State
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingState ? 'Edit State' : 'Add New State'}
                </DialogTitle>
                <DialogDescription>
                  {editingState 
                    ? 'Update the state details below.' 
                    : 'Create a new state or territory.'
                  }
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter state name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State Code</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter state code (e.g., MH, DL)"
                            className="uppercase"
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
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
                      {submitting ? "Saving..." : (editingState ? "Update" : "Create")}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search States
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search states..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredStates.length} of {states.length} states
            </div>
          </div>
        </CardContent>
      </Card>

      {/* States Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            States List
          </CardTitle>
          <CardDescription>
            Manage states and territories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Districts</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStates.map((state) => (
                  <TableRow key={state.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{state.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {state.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">0 districts</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOpenDialog(state)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteState(state.id)}
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
          
          {filteredStates.length === 0 && (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No states found matching your criteria.</p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add First State
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};