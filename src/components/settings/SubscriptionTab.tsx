
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, CreditCard, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { useUserSubscription } from "@/hooks/useUserSubscription";

const SubscriptionTab = () => {
  const { subscription, loading } = useUserSubscription();

  // Pricing plans from joincircl.com/pricing
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      planType: "free",
      features: [
        "Up to 100 contacts",
        "Basic relationship tracking",
        "Email support",
        "Mobile app access"
      ],
      contactLimit: 100,
      interactionLimit: 50
    },
    {
      name: "Professional",
      price: "$12",
      period: "per month",
      planType: "professional",
      features: [
        "Up to 2,500 contacts",
        "Advanced analytics",
        "AI-powered insights",
        "Priority support",
        "Custom fields",
        "Calendar integration"
      ],
      contactLimit: 2500,
      interactionLimit: 500
    },
    {
      name: "Business",
      price: "$24",
      period: "per month",
      planType: "business",
      features: [
        "Up to 10,000 contacts",
        "Team collaboration",
        "Advanced integrations",
        "Custom workflows",
        "API access",
        "White-label options"
      ],
      contactLimit: 10000,
      interactionLimit: 2000
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      planType: "enterprise",
      features: [
        "Unlimited contacts",
        "Custom integrations",
        "Dedicated support",
        "Advanced security",
        "Custom training",
        "SLA guarantee"
      ],
      contactLimit: -1, // Unlimited
      interactionLimit: -1
    }
  ];

  const currentPlan = plans.find(plan => plan.planType === subscription?.plan_type) || plans[0];
  const isCurrentPlan = (planType: string) => subscription?.plan_type === planType;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
              <p className="text-sm text-gray-600">You're currently on the {currentPlan.name} plan</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{currentPlan.name} Plan</h3>
              <p className="text-gray-600">
                {subscription?.current_period_end ? 
                  `Next billing: ${formatDate(subscription.current_period_end)}` :
                  'No billing date set'
                }
              </p>
            </div>
            <Badge className={subscription?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {subscription?.status || 'Unknown'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/80 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Contact Limit</span>
                <span className="text-xs text-gray-500">
                  {currentPlan.contactLimit === -1 ? 'Unlimited' : `0/${currentPlan.contactLimit}`}
                </span>
              </div>
              {currentPlan.contactLimit !== -1 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: '17%' }} // Example usage
                  ></div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-white/80 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Monthly Interactions</span>
                <span className="text-xs text-gray-500">
                  {currentPlan.interactionLimit === -1 ? 'Unlimited' : `0/${currentPlan.interactionLimit}`}
                </span>
              </div>
              {currentPlan.interactionLimit !== -1 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: '23%' }} // Example usage
                  ></div>
                </div>
              )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.planType}
                className={`p-6 rounded-lg border-2 transition-colors ${
                  isCurrentPlan(plan.planType)
                    ? 'border-blue-500 bg-blue-50/50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period !== "contact us" && (
                      <span className="text-gray-600">/{plan.period}</span>
                    )}
                  </div>
                  {isCurrentPlan(plan.planType) && (
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
                    isCurrentPlan(plan.planType)
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                  disabled={isCurrentPlan(plan.planType)}
                >
                  {isCurrentPlan(plan.planType) ? 'Current Plan' : 
                   plan.planType === 'enterprise' ? 'Contact Sales' : 
                   `Upgrade to ${plan.name}`}
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
          {subscription?.plan_type === 'free' ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No billing history for free plan</p>
              <p className="text-sm">Upgrade to a paid plan to see billing history</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">No billing history available</p>
                    <p className="text-sm text-gray-600">Billing history will appear here once payments are processed</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionTab;
