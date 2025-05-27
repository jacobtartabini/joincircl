
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Crown, 
  Check, 
  CreditCard, 
  Download, 
  Calendar,
  Users,
  Zap,
  Shield
} from "lucide-react";

const SubscriptionTab = () => {
  const currentPlan = {
    name: "Pro",
    price: 29,
    billing: "monthly",
    renewalDate: "2024-02-15",
    features: [
      "Unlimited contacts",
      "Advanced AI insights", 
      "Priority support",
      "Custom integrations"
    ]
  };

  const usage = {
    contacts: { current: 847, limit: "unlimited" },
    aiRequests: { current: 156, limit: 500 },
    storage: { current: 2.3, limit: 10 }
  };

  const plans = [
    {
      name: "Starter",
      price: 0,
      period: "forever",
      description: "Perfect for individuals getting started",
      features: [
        "Up to 100 contacts",
        "Basic organization",
        "Email support",
        "Mobile app access"
      ],
      current: false
    },
    {
      name: "Pro",
      price: 29,
      period: "month",
      description: "Advanced features for growing networks",
      features: [
        "Unlimited contacts",
        "AI-powered insights",
        "Advanced integrations",
        "Priority support",
        "Custom fields",
        "Bulk operations"
      ],
      current: true,
      popular: true
    },
    {
      name: "Team",
      price: 89,
      period: "month",
      description: "Collaboration tools for teams",
      features: [
        "Everything in Pro",
        "Team collaboration",
        "Shared contacts",
        "Admin controls",
        "SSO integration",
        "Advanced analytics"
      ],
      current: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Crown className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Current Plan</CardTitle>
                <p className="text-sm text-gray-600">You're on the {currentPlan.name} plan</p>
              </div>
            </div>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200">
              {currentPlan.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <div className="text-2xl font-bold text-blue-900">
                ${currentPlan.price}
                <span className="text-sm font-normal text-blue-700">/{currentPlan.billing}</span>
              </div>
              <p className="text-sm text-blue-700">Next billing: {currentPlan.renewalDate}</p>
            </div>
            <div className="text-right">
              <Button variant="outline" size="sm" className="border-blue-200 text-blue-700">
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            <h4 className="font-medium text-gray-900">Plan Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Usage This Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">Contacts</span>
              </div>
              <span className="font-medium">{usage.contacts.current} / {usage.contacts.limit}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">AI Requests</span>
              </div>
              <span className="font-medium">{usage.aiRequests.current} / {usage.aiRequests.limit}</span>
            </div>
            <Progress value={(usage.aiRequests.current / usage.aiRequests.limit) * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">Storage</span>
              </div>
              <span className="font-medium">{usage.storage.current}GB / {usage.storage.limit}GB</span>
            </div>
            <Progress value={(usage.storage.current / usage.storage.limit) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`border relative ${
                plan.current 
                  ? 'border-blue-500 ring-2 ring-blue-100' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg font-semibold">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-gray-900">
                  ${plan.price}
                  <span className="text-sm font-normal text-gray-500">/{plan.period}</span>
                </div>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className={`w-full ${
                    plan.current 
                      ? 'bg-gray-100 text-gray-700 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Billing History</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "Jan 15, 2024", amount: "$29.00", status: "Paid", invoice: "INV-001" },
              { date: "Dec 15, 2023", amount: "$29.00", status: "Paid", invoice: "INV-002" },
              { date: "Nov 15, 2023", amount: "$29.00", status: "Paid", invoice: "INV-003" }
            ].map((bill, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{bill.date}</p>
                    <p className="text-xs text-gray-500">Invoice {bill.invoice}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{bill.amount}</span>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    {bill.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionTab;
