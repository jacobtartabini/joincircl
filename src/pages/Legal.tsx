import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Scale, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Legal = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Legal Information</h1>
            <p className="text-gray-600 mt-1">Terms of service and privacy policy</p>
          </div>
        </div>
        
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Scale className="h-5 w-5 text-gray-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">Legal Documents</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="terms" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="terms" className="data-[state=active]:bg-white">
                  <Scale className="h-4 w-4 mr-2" />
                  Terms of Service
                </TabsTrigger>
                <TabsTrigger value="privacy" className="data-[state=active]:bg-white">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy Policy
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="terms" className="mt-8 space-y-6">
                <div className="prose prose-sm max-w-none text-gray-700">
                  <div className="border-b border-gray-200 pb-4 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Terms of Service</h2>
                    <p className="text-sm text-gray-500">Last updated: May 6, 2025</p>
                  </div>
                  
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h3>
                      <p className="leading-relaxed">
                        By accessing or using Circl ("we," "us," or "our") website, applications, and other products and services (collectively, the "Services"), 
                        you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Services.
                      </p>
                    </section>
                    
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Description of Services</h3>
                      <p className="leading-relaxed">
                        Circl is a personal relationship management platform designed to help users maintain and strengthen their professional and personal connections.
                        The Services may include, but are not limited to, contact management, interaction tracking, and reminder tools.
                      </p>
                    </section>
                    
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">3. User Accounts</h3>
                      <p className="leading-relaxed">
                        To access certain features of the Services, you may be required to create an account. You are responsible for maintaining the confidentiality of your account 
                        information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                      </p>
                    </section>
                    
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">4. User Content</h3>
                      <p className="leading-relaxed">
                        You retain all ownership rights to the content you upload to the Services. By uploading content, you grant us a worldwide, non-exclusive, royalty-free license 
                        to use, reproduce, process, and display your content solely for the purpose of providing the Services to you.
                      </p>
                    </section>
                    
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Prohibited Conduct</h3>
                      <p className="leading-relaxed">
                        You agree not to use the Services for any unlawful purpose or in any way that could damage, disable, overburden, or impair the Services. You agree not to 
                        attempt to gain unauthorized access to any part of the Services or any system or network connected to the Services.
                      </p>
                    </section>
                    
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Termination</h3>
                      <p className="leading-relaxed">
                        We may terminate or suspend your access to the Services at any time, with or without cause, and with or without notice. Upon termination, your right to use 
                        the Services will immediately cease.
                      </p>
                    </section>
                    
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Disclaimer of Warranties</h3>
                      <p className="leading-relaxed">
                        The Services are provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not warrant that the Services will be 
                        uninterrupted or error-free.
                      </p>
                    </section>
                    
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Limitation of Liability</h3>
                      <p className="leading-relaxed">
                        In no event shall Circl be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, 
                        use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Services.
                      </p>
                    </section>
                    
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">9. Changes to Terms</h3>
                      <p className="leading-relaxed">
                        We reserve the right to modify these Terms at any time. We will provide notice of any material changes by posting the new Terms on the Services. Your continued 
                        use of the Services after such changes constitutes your acceptance of the new Terms.
                      </p>
                    </section>
                    
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">10. Governing Law</h3>
                      <p className="leading-relaxed">
                        These Terms shall be governed by the laws of the State of [State], without regard to its conflict of law provisions.
                      </p>
                    </section>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="privacy" className="mt-8 space-y-6">
                <div className="prose prose-sm max-w-none text-gray-700">
                  <div className="border-b border-gray-200 pb-4 mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Privacy Policy</h2>
                    <p className="text-sm text-gray-500">Last updated: May 6, 2025</p>
                  </div>
                  
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Information We Collect</h3>
                      <p className="leading-relaxed">
                        We collect information you provide directly to us when you create an account, update your profile, use interactive features, or otherwise communicate with us. 
                        This information may include your name, email address, password, profile picture, and any other information you choose to provide.
                      </p>
                    </section>
                    
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">2. How We Use Your Information</h3>
                      <p className="leading-relaxed">
                        We use the information we collect to provide, maintain, and improve our Services, to process transactions, to send you technical notices, updates, and 
                        administrative messages, and to respond to your comments, questions, and customer service requests.
                      </p>
                    </section>
                    
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Data Storage and Security</h3>
                      <p className="leading-relaxed">
                        We use commercially reasonable safeguards to help keep the information collected through the Services secure and take reasonable steps to verify your identity 
                        before granting you access to your account. However, we cannot ensure the security of any information you transmit to us or guarantee that information on the 
                        Services may not be accessed, disclosed, altered, or destroyed.
                      </p>
                    </section>
                    
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Sharing Your Information</h3>
                      <p className="leading-relaxed">
                        We do not share, sell, or lease personal information about you to any third-parties for their marketing use. We may share information about you as follows or as 
                        otherwise described in this Privacy Policy: with vendors, consultants and other service providers who need access to such information to carry out work on our behalf.
                      </p>
                    </section>
                    
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">5. Your Choices</h3>
                      <p className="leading-relaxed">
                        You may update, correct or delete information about you at any time by logging into your account and modifying your information or by emailing us. If you wish to 
                        delete or deactivate your account, please email us, but note that we may retain certain information as required by law or for legitimate business purposes.
                      </p>
                    </section>
                    
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">6. Cookies</h3>
                      <p className="leading-relaxed">
                        We use cookies and similar technologies to collect information about your browsing activities and to distinguish you from other users of our Services. This helps 
                        us to provide you with a good experience when you browse our Services and also allows us to improve our Services.
                      </p>
                    </section>
                    
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">7. Changes to this Privacy Policy</h3>
                      <p className="leading-relaxed">
                        We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, 
                        we may provide you with additional notice (such as adding a statement to our homepage or sending you a notification).
                      </p>
                    </section>
                    
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">8. Contact Us</h3>
                      <p className="leading-relaxed">
                        If you have any questions about this Privacy Policy, please contact us at privacy@circl.app.
                      </p>
                    </section>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Legal;
