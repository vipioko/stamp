import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, FileText, Clock, Shield, Star } from "lucide-react";
import { Link } from "react-router-dom";

export const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-success/5 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Get Your <span className="text-primary">E-Stamp</span> Instantly
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Legal, secure, and instant digital stamps with door delivery option. 
              Trusted by thousands of businesses across India.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/select-state">Get E-Stamp Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose e-StampExpress?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional, fast, and secure stamp services with guaranteed authenticity
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Clock,
                title: "Instant Processing",
                description: "Get your digital stamps in seconds, available 24/7"
              },
              {
                icon: Shield,
                title: "100% Legal",
                description: "Government authorized stamps with full legal validity"
              },
              {
                icon: FileText,
                title: "Multiple Formats",
                description: "Digital delivery via email/WhatsApp or door delivery"
              },
              {
                icon: CheckCircle,
                title: "Guaranteed Delivery",
                description: "Money-back guarantee if delivery fails"
              }
            ].map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
                <span className="text-lg font-semibold">4.9/5 Rating</span>
              </div>
              <div className="text-lg">
                <span className="font-bold text-primary">50,000+</span> Stamps Delivered
              </div>
              <div className="text-lg">
                <span className="font-bold text-primary">99.9%</span> Success Rate
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Trusted by businesses, individuals, and legal professionals across India. 
              Government approved and legally recognized.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple 6-step process to get your stamps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Select State", description: "Choose your state and district" },
              { step: "2", title: "Enter Details", description: "Fill in party and address details" },
              { step: "3", title: "Choose Stamp", description: "Select stamp type and amount" },
              { step: "4", title: "Select Delivery", description: "Digital or door delivery option" },
              { step: "5", title: "Make Payment", description: "Secure online payment" },
              { step: "6", title: "Receive Stamp", description: "Instant download or door delivery" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Your E-Stamp?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of satisfied customers who trust us for their stamp needs
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
            <Link to="/select-state">Start Your Order</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};