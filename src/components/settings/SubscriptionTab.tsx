import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Calendar, Users, Zap, Check, Loader2 } from "lucide-react";
import { useUserSubscription } from "@/hooks/useUserSubscription";
const SubscriptionTab = () => {
  const {
    subscription,
    loading
  } = useUserSubscription();
  const plans = {
    free: {
      name: "Free",
      price: "$0",
      period: "forever",
      features: ["Up to 50 contacts", "Basic interaction tracking", "Email notifications", "Mobile app access"],
      limits: {
        contacts: 50,
        interactions: 100
      }
    },
    pro: {
      name: "Pro",
      price: "$19",
      period: "per month",
      features: ["Unlimited contacts", "Advanced analytics", "Integration with CRM tools", "Priority support", "Custom tags and fields", "Bulk import/export"],
      limits: {
        contacts: "unlimited",
        interactions: "unlimited"
      }
    },
    business: {
      name: "Business",
      price: "$49",
      period: "per month",
      features: ["Everything in Pro", "Team collaboration", "Advanced automation", "Custom integrations", "Dedicated account manager", "SSO & security features"],
      limits: {
        contacts: "unlimited",
        interactions: "unlimited"
      }
    }
  };
  const currentPlan = plans[subscription?.plan_type as keyof typeof plans] || plans.free;
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>;
  }
  return <div className="space-y-8">
      {/* Current Plan */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Current Plan</CardTitle>
                <p className="text-sm text-gray-600">Manage your subscription and billing</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {currentPlan.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Plan</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{currentPlan.name}</p>
              <p className="text-sm text-gray-500">{currentPlan.price} {currentPlan.period}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Status</span>
              </div>
              <p className="text-lg font-semibold text-green-600">
                {subscription?.status === 'active' ? 'Active' : 'Inactive'}
              </p>
              {subscription?.current_period_end && <p className="text-sm text-gray-500">
                  Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>}
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Usage</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">Contact Limit</p>
              <p className="text-sm text-gray-500">
                {typeof currentPlan.limits.contacts === 'string' ? currentPlan.limits.contacts : `${currentPlan.limits.contacts} contacts`}
              </p>
            </div>
          </div>

          {subscription?.plan_type === 'free' && <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Upgrade Available</span>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Unlock unlimited contacts and advanced features with Pro or Business plans.
              </p>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Upgrade Now
              </Button>
            </div>}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg font-semibold text-gray-900">Available Plans</CardTitle>
          <p className="text-sm text-gray-600">Choose the plan that best fits your needs</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(plans).map(([key, plan]) => <div key={key} className={`p-6 rounded-lg border-2 transition-all ${subscription?.plan_type === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 ml-1">/{plan.period.split(' ')[1] || ''}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => <li key={index} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>)}
                </ul>

                <Button variant={subscription?.plan_type === key ? "secondary" : "default"} disabled={subscription?.plan_type === key} className="w-full rounded-full">
                  {subscription?.plan_type === key ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </div>)}
          </div>
        </CardContent>
      </Card>

      {/* Billing Information */}
      {subscription?.plan_type !== 'free' && <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-lg font-semibold text-gray-900">Billing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Payment Method</p>
                <p className="text-sm text-gray-500">•••• •••• •••• 4242</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full">
                Update
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Billing Address</p>
                <p className="text-sm text-gray-500">Update your billing information</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full">
                Edit
              </Button>
            </div>

            {subscription?.cancel_at_period_end && <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Your subscription will be canceled at the end of the current billing period.
                </p>
              </div>}
          </CardContent>
        </Card>}
    </div>;
};
export default SubscriptionTab;