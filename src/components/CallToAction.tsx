import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";

export const CallToAction = () => {
  return (
    <section className="py-20 px-4">
      <div className="container max-w-4xl">
        <div className="gradient-primary rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          
          <div className="relative z-10">
            <div className="inline-block mb-6">
              <Sparkles className="h-16 w-16 animate-pulse-soft" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Scripture Learning?
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of believers building a daily Bible habit through fun, interactive games. Start your journey today—completely free!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6 shadow-xl hover:scale-105 transition-transform">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20">
                Learn More
              </Button>
            </div>
            <p className="mt-6 text-sm text-white/80">
              No credit card required • 8 games included • Join a growing community
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
