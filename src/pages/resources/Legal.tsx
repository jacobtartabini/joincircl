
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

export default function Legal() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Legal Information</h1>
          <p className="text-muted-foreground">
            Terms, policies, and legal documents
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Legal Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="terms">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="terms">Terms of Service</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
              <TabsTrigger value="cookies">Cookies Policy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="terms" className="space-y-4">
              <h2 className="text-lg font-semibold">Terms of Service</h2>
              <p className="text-sm text-muted-foreground">Last updated: May 6, 2025</p>
              
              <div className="space-y-4">
                <section className="space-y-2">
                  <h3 className="font-medium">1. Acceptance of Terms</h3>
                  <p className="text-sm">
                    By accessing or using Circl ("we," "us," or "our") website, applications, and other products and services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use our Services.
                  </p>
                </section>
                
                <section className="space-y-2">
                  <h3 className="font-medium">2. Changes to Terms</h3>
                  <p className="text-sm">
                    We may modify these Terms at any time, in our sole discretion. If we do so, we will notify you either through the user interface, by sending you an email, or by other means. Your continued use of the Services after any modifications indicates your acceptance of the modified Terms.
                  </p>
                </section>
                
                <section className="space-y-2">
                  <h3 className="font-medium">3. Your Account</h3>
                  <p className="text-sm">
                    To use certain features of our Services, you may need to create an account. You are responsible for maintaining the confidentiality of your account login information and are fully responsible for all activities that occur under your account.
                  </p>
                </section>
                
                <section className="space-y-2">
                  <h3 className="font-medium">4. User Content</h3>
                  <p className="text-sm">
                    Our Services may allow you to store, share, or otherwise make available certain information, text, graphics, or other material (collectively, "User Content"). You retain any rights that you had in your User Content before you stored, shared, or made it available on or through the Services.
                  </p>
                </section>
                
                <section className="space-y-2">
                  <h3 className="font-medium">5. Limitations and Disclaimers</h3>
                  <p className="text-sm">
                    The Services and all included content are provided on an "as is" basis without warranty of any kind. We disclaim all warranties, express or implied, including but not limited to, implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
                  </p>
                </section>
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="space-y-4">
              <h2 className="text-lg font-semibold">Privacy Policy</h2>
              <p className="text-sm text-muted-foreground">Last updated: May 6, 2025</p>
              
              <div className="space-y-4">
                <section className="space-y-2">
                  <h3 className="font-medium">1. Introduction</h3>
                  <p className="text-sm">
                    This Privacy Policy describes how Circl ("we," "us," or "our") collects, uses, and shares information in connection with your use of our websites, applications, and other services (collectively, the "Services"). This Privacy Policy does not apply to information we collect from our employees or contractors.
                  </p>
                </section>
                
                <section className="space-y-2">
                  <h3 className="font-medium">2. Information We Collect</h3>
                  <p className="text-sm">
                    We collect information that you provide directly to us, such as when you create an account, update your profile, use our interactive features, or contact us. This information may include your name, email address, phone number, and any other information you choose to provide.
                  </p>
                </section>
                
                <section className="space-y-2">
                  <h3 className="font-medium">3. Use of Information</h3>
                  <p className="text-sm">
                    We use the information we collect to provide, maintain, and improve our Services, to process your requests and transactions, to send you communications, to customize your experience, and for other purposes described in this Privacy Policy.
                  </p>
                </section>
                
                <section className="space-y-2">
                  <h3 className="font-medium">4. Sharing of Information</h3>
                  <p className="text-sm">
                    We may share the information we collect in various ways, including with vendors and service providers who work on our behalf, when required by law, in connection with a sale or merger, and with your consent.
                  </p>
                </section>
                
                <section className="space-y-2">
                  <h3 className="font-medium">5. Data Security</h3>
                  <p className="text-sm">
                    We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
                  </p>
                </section>
              </div>
            </TabsContent>
            
            <TabsContent value="cookies" className="space-y-4">
              <h2 className="text-lg font-semibold">Cookies Policy</h2>
              <p className="text-sm text-muted-foreground">Last updated: May 6, 2025</p>
              
              <div className="space-y-4">
                <section className="space-y-2">
                  <h3 className="font-medium">1. What Are Cookies</h3>
                  <p className="text-sm">
                    Cookies are small text files that are stored on your device when you visit a website. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
                  </p>
                </section>
                
                <section className="space-y-2">
                  <h3 className="font-medium">2. How We Use Cookies</h3>
                  <p className="text-sm">
                    We use cookies to recognize you when you visit our Services, remember your preferences, and give you a personalized experience that's consistent with your settings. Cookies also make your interactions with our Services faster and more secure.
                  </p>
                </section>
                
                <section className="space-y-2">
                  <h3 className="font-medium">3. Types of Cookies We Use</h3>
                  <p className="text-sm">
                    We use different types of cookies for different purposes: strictly necessary cookies, performance cookies, functionality cookies, and targeting/advertising cookies.
                  </p>
                </section>
                
                <section className="space-y-2">
                  <h3 className="font-medium">4. Managing Cookies</h3>
                  <p className="text-sm">
                    Most web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your browser to remove or reject cookies. Please note that if you choose to remove or reject cookies, this could affect certain features of our Services.
                  </p>
                </section>
                
                <section className="space-y-2">
                  <h3 className="font-medium">5. Contact Us</h3>
                  <p className="text-sm">
                    If you have any questions about our use of cookies, please contact us at privacy@circl.com.
                  </p>
                </section>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
