
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, CreditCard, Calendar, TrendingUp } from "lucide-react";

const SubscriptionTab = () => {
  const currentPlan = "Pro";
  const nextBilling = "April 15, 2024";
  const monthlyUsage = {
    contacts: 847,
    contactsLimit: 5000,
    interactions: 234,
    interactionsLimit: 1000,
    storage: 2.4,
    storageLimit: 10
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "Up to 100 contacts",
        "Basic relationship tracking",
        "Email support"
      ],
      current: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      features: [
        "Up to 5,000 contacts",
        "Advanced analytics",
        "AI-powered insights",
        "Priority support",
        "Custom fields"
      ],
      current: true
    },
    {
      name: "Enterprise",
      price: "$49",
      period: "per month",
      features: [
        "Unlimited contacts",
        "Team collaboration",
        "Advanced integrations",
        "Custom branding",
        "Dedicated support"
      ],
      current: false
    }
  ];

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-purple-50 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Current Plan</CardTitle>
              <p className="text-sm text-gray-600">You're currently on the {currentPlan} plan</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{currentPlan} Plan</h3>
              <p className="text-gray-600">Next billing: {nextBilling}</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/80 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Contacts</span>
                <span className="text-xs text-gray-500">{monthlyUsage.contacts}/{monthlyUsage.contactsLimit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(monthlyUsage.contacts / monthlyUsage.contactsLimit) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="p-4 bg-white/80 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Interactions</span>
                <span className="text-xs text-gray-500">{monthlyUsage.interactions}/{monthlyUsage.interactionsLimit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(monthlyUsage.interactions / monthlyUsage.interactionsLimit) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="p-4 bg-white/80 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Storage</span>
                <span className="text-xs text-gray-500">{monthlyUsage.storage}/{monthlyUsage.storageLimit} GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${(monthlyUsage.storage / monthlyUsage.storageLimit) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg font-semibold text-gray-900">Available Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.name}
                className={`p-6 rounded-lg border-2 transition-colors ${
                  plan.current 
                    ? 'border-blue-500 bg-blue-50/50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  {plan.current && (
                    <Badge className="bg-blue-100 text-blue-800">Current Plan</Badge>
                  )}
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.current 
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-gray-600" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900">Billing History</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "March 15, 2024", amount: "$19.00", status: "Paid" },
              { date: "February 15, 2024", amount: "$19.00", status: "Paid" },
              { date: "January 15, 2024", amount: "$19.00", status: "Paid" }
            ].map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">{invoice.date}</p>
                    <p className="text-sm text-gray-600">Pro Plan</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{invoice.amount}</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    {invoice.status}
                  </Badge>
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
