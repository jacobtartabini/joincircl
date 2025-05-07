
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Legal = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-3xl font-bold">Legal Information</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Legal Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="terms" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="terms">Terms of Service</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="terms" className="mt-6 space-y-4">
              <div className="prose prose-sm max-w-none">
                <h2>Terms of Service</h2>
                <p className="text-sm text-muted-foreground">Last updated: May 6, 2025</p>
                
                <h3>1. Acceptance of Terms</h3>
                <p>
                  By accessing or using Circl ("we," "us," or "our") website, applications, and other products and services (collectively, the "Services"), 
                  you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Services.
                </p>
                
                <h3>2. Description of Services</h3>
                <p>
                  Circl is a personal relationship management platform designed to help users maintain and strengthen their professional and personal connections.
                  The Services may include, but are not limited to, contact management, interaction tracking, and reminder tools.
                </p>
                
                <h3>3. User Accounts</h3>
                <p>
                  To access certain features of the Services, you may be required to create an account. You are responsible for maintaining the confidentiality of your account 
                  information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                </p>
                
                <h3>4. User Content</h3>
                <p>
                  You retain all ownership rights to the content you upload to the Services. By uploading content, you grant us a worldwide, non-exclusive, royalty-free license 
                  to use, reproduce, process, and display your content solely for the purpose of providing the Services to you.
                </p>
                
                <h3>5. Prohibited Conduct</h3>
                <p>
                  You agree not to use the Services for any unlawful purpose or in any way that could damage, disable, overburden, or impair the Services. You agree not to 
                  attempt to gain unauthorized access to any part of the Services or any system or network connected to the Services.
                </p>
                
                <h3>6. Termination</h3>
                <p>
                  We may terminate or suspend your access to the Services at any time, with or without cause, and with or without notice. Upon termination, your right to use 
                  the Services will immediately cease.
                </p>
                
                <h3>7. Disclaimer of Warranties</h3>
                <p>
                  The Services are provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not warrant that the Services will be 
                  uninterrupted or error-free.
                </p>
                
                <h3>8. Limitation of Liability</h3>
                <p>
                  In no event shall Circl be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, 
                  use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Services.
                </p>
                
                <h3>9. Changes to Terms</h3>
                <p>
                  We reserve the right to modify these Terms at any time. We will provide notice of any material changes by posting the new Terms on the Services. Your continued 
                  use of the Services after such changes constitutes your acceptance of the new Terms.
                </p>
                
                <h3>10. Governing Law</h3>
                <p>
                  These Terms shall be governed by the laws of the State of [State], without regard to its conflict of law provisions.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="privacy" className="mt-6 space-y-4">
              <div className="prose prose-sm max-w-none">
                <h2>Privacy Policy</h2>
                <p className="text-sm text-muted-foreground">Last updated: May 6, 2025</p>
                
                <h3>1. Information We Collect</h3>
                <p>
                  We collect information you provide directly to us when you create an account, update your profile, use interactive features, or otherwise communicate with us. 
                  This information may include your name, email address, password, profile picture, and any other information you choose to provide.
                </p>
                
                <h3>2. How We Use Your Information</h3>
                <p>
                  We use the information we collect to provide, maintain, and improve our Services, to process transactions, to send you technical notices, updates, and 
                  administrative messages, and to respond to your comments, questions, and customer service requests.
                </p>
                
                <h3>3. Data Storage and Security</h3>
                <p>
                  We use commercially reasonable safeguards to help keep the information collected through the Services secure and take reasonable steps to verify your identity 
                  before granting you access to your account. However, we cannot ensure the security of any information you transmit to us or guarantee that information on the 
                  Services may not be accessed, disclosed, altered, or destroyed.
                </p>
                
                <h3>4. Sharing Your Information</h3>
                <p>
                  We do not share, sell, or lease personal information about you to any third-parties for their marketing use. We may share information about you as follows or as 
                  otherwise described in this Privacy Policy: with vendors, consultants and other service providers who need access to such information to carry out work on our behalf.
                </p>
                
                <h3>5. Your Choices</h3>
                <p>
                  You may update, correct or delete information about you at any time by logging into your account and modifying your information or by emailing us. If you wish to 
                  delete or deactivate your account, please email us, but note that we may retain certain information as required by law or for legitimate business purposes.
                </p>
                
                <h3>6. Cookies</h3>
                <p>
                  We use cookies and similar technologies to collect information about your browsing activities and to distinguish you from other users of our Services. This helps 
                  us to provide you with a good experience when you browse our Services and also allows us to improve our Services.
                </p>
                
                <h3>7. Changes to this Privacy Policy</h3>
                <p>
                  We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, 
                  we may provide you with additional notice (such as adding a statement to our homepage or sending you a notification).
                </p>
                
                <h3>8. Contact Us</h3>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at privacy@circl.app.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Legal;
