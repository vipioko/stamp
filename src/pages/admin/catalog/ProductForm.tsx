import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { 
  createStampProduct, 
  updateStampProduct, 
  getStampProductById,
  getStates, 
  getStampCategories,
  type StampProduct,
  type State,
  type StampCategory
} from '@/lib/firestore';

const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  stateId: z.string().min(1, "Please select a state"),
  categoryId: z.string().min(1, "Please select a category"),
  amount: z.string().min(1, "Amount is required").transform(val => parseInt(val)),
  platformFee: z.string().min(0, "Platform fee must be 0 or greater").transform(val => parseInt(val)),
  expressFee: z.string().min(0, "Express fee must be 0 or greater").transform(val => parseInt(val)),
  deliveryFee: z.string().min(0, "Delivery fee must be 0 or greater").transform(val => parseInt(val)),
  deliveryTime: z.string().min(1, "Delivery time is required"),
});

type ProductForm = z.infer<typeof productSchema>;

export const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = id !== 'new';
  
  const [states, setStates] = useState<State[]>([]);
  const [categories, setCategories] = useState<StampCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      stateId: '',
      categoryId: '',
      amount: 0,
      platformFee: 0,
      expressFee: 0,
      deliveryFee: 0,
      deliveryTime: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statesData, categoriesData] = await Promise.all([
          getStates(),
          getStampCategories()
        ]);

        setStates(statesData);
        setCategories(categoriesData);

        if (isEdit && id) {
          const product = await getStampProductById(id);
          if (product) {
            form.reset({
              name: product.name,
              stateId: product.stateId,
              categoryId: product.categoryId,
              amount: product.amount,
              platformFee: product.platformFee,
              expressFee: product.expressFee || 0,
              deliveryFee: product.deliveryFee || 0,
              deliveryTime: product.deliveryTime,
            });
          } else {
            toast({
              title: "Product Not Found",
              description: "The requested product could not be found.",
              variant: "destructive",
            });
            navigate('/admin/catalog/products');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load form data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit, form, navigate, toast]);

  const onSubmit = async (data: ProductForm) => {
    setSubmitting(true);
    try {
      const productData = {
        name: data.name,
        stateId: data.stateId,
        categoryId: data.categoryId,
        amount: data.amount,
        platformFee: data.platformFee,
        expressFee: data.expressFee,
        deliveryFee: data.deliveryFee,
        deliveryTime: data.deliveryTime,
      };

      if (isEdit && id) {
        await updateStampProduct(id, productData);
        toast({
          title: "Product Updated",
          description: "Product has been successfully updated.",
        });
      } else {
        await createStampProduct(productData);
        toast({
          title: "Product Created",
          description: "Product has been successfully created.",
        });
      }

      navigate('/admin/catalog/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save product.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/catalog/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(8)].map((_, i) => (
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/catalog/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update product details' : 'Create a new stamp product'}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Details
          </CardTitle>
          <CardDescription>
            Fill in the product information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter product name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Amount (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="0"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="platformFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform Fee (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="0"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expressFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Express Fee (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="0"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliveryFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Fee (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="0"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="deliveryTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Time</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., instant, 1-2 days, 3-5 days" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/catalog/products')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEdit ? 'Update Product' : 'Create Product'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};