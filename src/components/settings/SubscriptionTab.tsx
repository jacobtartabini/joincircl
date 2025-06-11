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
    return <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>;
  }
  return <div className="space-y-10">
      {/* Current Plan */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">Current Plan</CardTitle>
                <p className="text-gray-600 mt-1">Manage your subscription and billing</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-4 py-2 text-sm font-medium rounded-full">
              {currentPlan.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Plan</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{currentPlan.name}</p>
              <p className="text-gray-500 mt-1">{currentPlan.price} {currentPlan.period}</p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Status</span>
              </div>
              <p className="text-xl font-bold text-green-600">
                {subscription?.status === 'active' ? 'Active' : 'Inactive'}
              </p>
              {subscription?.current_period_end && <p className="text-gray-500 mt-1">
                  Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>}
            </div>

            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Usage</span>
              </div>
              <p className="text-xl font-bold text-gray-900">Contact Limit</p>
              <p className="text-gray-500 mt-1">
                {typeof currentPlan.limits.contacts === 'string' ? currentPlan.limits.contacts : `${currentPlan.limits.contacts} contacts`}
              </p>
            </div>
          </div>

          {subscription?.plan_type === 'free' && <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="text-base font-semibold text-blue-900">Upgrade Available</span>
              </div>
              <p className="text-blue-700 mb-4 leading-relaxed">
                Unlock unlimited contacts and advanced features with Pro or Business plans.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-full px-6">
                Upgrade Now
              </Button>
            </div>}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-8">
          <CardTitle className="text-xl font-semibold text-gray-900">Available Plans</CardTitle>
          <p className="text-gray-600 mt-1">Choose the plan that best fits your needs</p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {Object.entries(plans).map(([key, plan]) => <div key={key} className={`p-8 rounded-xl border-2 transition-all ${subscription?.plan_type === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}`}>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 ml-2">/{plan.period.split(' ')[1] || ''}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 leading-relaxed">{feature}</span>
                    </li>)}
                </ul>

                <Button variant={subscription?.plan_type === key ? "secondary" : "default"} disabled={subscription?.plan_type === key} size="lg" className="w-full rounded-full py-3 text-base font-medium bg-[#30a2ed]">
                  {subscription?.plan_type === key ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </div>)}
          </div>
        </CardContent>
      </Card>

      {/* Billing Information */}
      {subscription?.plan_type !== 'free' && <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="pb-8">
            <CardTitle className="text-xl font-semibold text-gray-900">Billing Information</CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-6">
            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="font-semibold text-gray-900">Payment Method</p>
                <p className="text-gray-500 mt-1">•••• •••• •••• 4242</p>
              </div>
              <Button variant="outline" className="rounded-full px-6">
                Update
              </Button>
            </div>

            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="font-semibold text-gray-900">Billing Address</p>
                <p className="text-gray-500 mt-1">Update your billing information</p>
              </div>
              <Button variant="outline" className="rounded-full px-6">
                Edit
              </Button>
            </div>

            {subscription?.cancel_at_period_end && <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-yellow-800 leading-relaxed">
                  Your subscription will be canceled at the end of the current billing period.
                </p>
              </div>}
          </CardContent>
        </Card>}
    </div>;
};
export default SubscriptionTab;