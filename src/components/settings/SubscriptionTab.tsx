
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, Users, Zap, Check, Loader2, Settings } from "lucide-react";
import { useUserSubscription } from "@/hooks/useUserSubscription";
import { toast } from "@/hooks/use-toast";

const PLANS = {
  free: {
    name: "Free",
    price: "$0",
    price_id: undefined,
    features: [
      "Up to 50 contacts",
      "Basic interaction tracking",
      "Email notifications",
      "Mobile app access"
    ],
  },
  pro: {
    name: "Pro",
    price: "$19",
    price_id: "price_1PCuzBJNfdMIE8sydztestpro", // <-- FILL IN WITH YOUR ACTUAL PRO PRICE ID FROM STRIPE DASHBOARD
    features: [
      "Unlimited contacts",
      "Advanced analytics",
      "Integration with CRM tools",
      "Priority support",
      "Custom tags and fields",
      "Bulk import/export"
    ]
  },
  business: {
    name: "Business",
    price: "$49",
    price_id: "price_1PCuzBJNfdMIE8sybizzzz", // <-- FILL IN WITH YOUR BUSINESS PRICE ID FROM STRIPE DASHBOARD
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Advanced automation",
      "Custom integrations",
      "Dedicated account manager",
      "SSO & security features"
    ]
  }
};

const SubscriptionTab = () => {
  const { subscription, loading, refetch } = useUserSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const currentPlanKey = subscription?.plan_type || "free";
  const currentPlan = PLANS[currentPlanKey as keyof typeof PLANS] || PLANS.free;

  const handleUpgrade = async (plan_key: string) => {
    setCheckoutLoading(plan_key);
    try {
      const plan = PLANS[plan_key as keyof typeof PLANS];
      if (!plan.price_id) throw new Error("No Stripe price id configured for this plan. Contact support.");
      const { data, error } = await window.supabase.functions.invoke("create-checkout", {
        body: { plan_price_id: plan.price_id },
      });
      if (error || !data?.url) throw error || new Error("No checkout URL");
      window.open(data.url, "_blank");
      toast({ title: "Redirected to Stripe", description: "Complete your checkout in the newly opened tab." });
      // Optionally: refetch trigger after a delay to reload status
      setTimeout(refetch, 6000);
    } catch (e) {
      toast({ title: "Error", description: e?.message || `${e}`, variant: "destructive" });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await window.supabase.functions.invoke("customer-portal");
      if (error || !data?.url) throw error || new Error("No portal URL");
      window.open(data.url, "_blank");
      toast({ title: "Stripe Portal", description: "Manage your subscription in the newly opened tab." });
    } catch (e) {
      toast({ title: "Error", description: e?.message || `${e}`, variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
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
              <p className={`text-xl font-bold ${subscription?.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                {subscription?.status === 'active' ? 'Active' : (subscription?.status || 'Inactive')}
              </p>
              {subscription?.current_period_end && (
                <p className="text-gray-500 mt-1">
                  Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Usage</span>
              </div>
              <p className="text-xl font-bold text-gray-900">Contact Limit</p>
              <p className="text-gray-500 mt-1">
                {currentPlanKey === "free"
                  ? "50 contacts"
                  : "Unlimited contacts"}
              </p>
            </div>
          </div>

          {currentPlanKey === "free" && (
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="text-base font-semibold text-blue-900">Upgrade Available</span>
              </div>
              <p className="text-blue-700 mb-4 leading-relaxed">
                Unlock unlimited contacts and advanced features with Pro or Business plans.
              </p>
              <div className="flex gap-3">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 rounded-full px-6"
                  onClick={() => handleUpgrade("pro")}
                  disabled={checkoutLoading !== null}
                  loading={checkoutLoading === "pro"}
                >
                  {checkoutLoading === "pro" ? "Redirecting..." : "Upgrade to Pro"}
                </Button>
                <Button
                  className="bg-gray-900 hover:bg-gray-950 rounded-full px-6"
                  onClick={() => handleUpgrade("business")}
                  disabled={checkoutLoading !== null}
                  loading={checkoutLoading === "business"}
                >
                  {checkoutLoading === "business" ? "Redirecting..." : "Upgrade to Business"}
                </Button>
              </div>
            </div>
          )}

          {currentPlanKey !== "free" && (
            <div className="flex gap-3">
              <Button
                className="rounded-full px-6"
                onClick={handleManage}
                disabled={portalLoading}
                loading={portalLoading}
                variant="outline"
              >
                <Settings className="h-5 w-5 mr-2" />
                Manage Subscription
              </Button>
              <Button
                className="rounded-full px-6 bg-gray-200 text-gray-800"
                onClick={refetch}
                variant="secondary"
              >
                Refresh Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans grid */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-8">
          <CardTitle className="text-xl font-semibold text-gray-900">Available Plans</CardTitle>
          <p className="text-gray-600 mt-1">Choose the plan that best fits your needs</p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {Object.entries(PLANS).map(([key, plan]) => (
              <div
                key={key}
                className={`p-8 rounded-xl border-2 transition-all ${
                  currentPlanKey === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 ml-2">{key !== "free" ? "/month" : ""}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                {currentPlanKey === key ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full rounded-full py-3 text-base font-medium"
                    disabled
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="w-full rounded-full py-3 text-base font-medium bg-[#30a2ed]"
                    onClick={() => handleUpgrade(key)}
                    disabled={checkoutLoading !== null}
                  >
                    {checkoutLoading === key ? "Redirecting..." : `Upgrade to ${plan.name}`}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default SubscriptionTab;
