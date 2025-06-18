import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ShieldX, Home } from "lucide-react";

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-800 rounded-full flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Access Denied</h1>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            You don&apos;t have permission to access this page. Please contact
            your administrator or try logging in with the appropriate
            credentials.
          </p>

          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Go to Homepage
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;
