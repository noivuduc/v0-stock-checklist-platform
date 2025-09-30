import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, TrendingUp, BarChart3, ArrowRight, Star } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">StockCheck</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <Badge variant="secondary" className="mb-4">
            Professional Stock Screening Platform
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold text-balance">
            Screen Stocks Like a<span className="text-primary"> Pro Investor</span>
          </h1>

          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Create custom investment checklists and automatically evaluate stocks against your criteria. Make
            data-driven investment decisions with real-time financial data.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-lg px-8">
                Start Screening Stocks
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Stock Screening Features</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to find winning stocks based on your investment strategy
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <CheckSquare className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Custom Checklists</CardTitle>
              <CardDescription>
                Create personalized screening criteria based on your investment philosophy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• P/E ratio, market cap, volume filters</li>
                <li>• Dividend yield and sector screening</li>
                <li>• Multiple criteria combinations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Real-Time Data</CardTitle>
              <CardDescription>Access live financial data from premium market data providers</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Live stock prices and metrics</li>
                <li>• Financial ratios and fundamentals</li>
                <li>• Market cap and trading volume</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Detailed Analysis</CardTitle>
              <CardDescription>Get comprehensive evaluation results with pass/fail scoring</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Percentage-based scoring system</li>
                <li>• Detailed criteria breakdown</li>
                <li>• Export results for further analysis</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-muted-foreground text-lg">Start free and upgrade as your screening needs grow</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="text-3xl font-bold">
                $0<span className="text-sm font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckSquare className="h-4 w-4 text-green-500 mr-2" />3 custom checklists
                </li>
                <li className="flex items-center">
                  <CheckSquare className="h-4 w-4 text-green-500 mr-2" />
                  10 stock evaluations/month
                </li>
                <li className="flex items-center">
                  <CheckSquare className="h-4 w-4 text-green-500 mr-2" />
                  Basic financial data
                </li>
              </ul>
              <Link href="/auth/sign-up">
                <Button className="w-full">Get Started Free</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-primary relative">
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <Star className="h-3 w-3 mr-1" />
              Most Popular
            </Badge>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For serious investors</CardDescription>
              <div className="text-3xl font-bold">
                $29<span className="text-sm font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckSquare className="h-4 w-4 text-green-500 mr-2" />
                  25 custom checklists
                </li>
                <li className="flex items-center">
                  <CheckSquare className="h-4 w-4 text-green-500 mr-2" />
                  100 stock evaluations/month
                </li>
                <li className="flex items-center">
                  <CheckSquare className="h-4 w-4 text-green-500 mr-2" />
                  Premium financial data
                </li>
                <li className="flex items-center">
                  <CheckSquare className="h-4 w-4 text-green-500 mr-2" />
                  Export results
                </li>
              </ul>
              <Link href="/auth/sign-up">
                <Button className="w-full">Start Pro Trial</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>For investment firms</CardDescription>
              <div className="text-3xl font-bold">
                $99<span className="text-sm font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckSquare className="h-4 w-4 text-green-500 mr-2" />
                  100 custom checklists
                </li>
                <li className="flex items-center">
                  <CheckSquare className="h-4 w-4 text-green-500 mr-2" />
                  1000 stock evaluations/month
                </li>
                <li className="flex items-center">
                  <CheckSquare className="h-4 w-4 text-green-500 mr-2" />
                  Real-time data feeds
                </li>
                <li className="flex items-center">
                  <CheckSquare className="h-4 w-4 text-green-500 mr-2" />
                  API access
                </li>
              </ul>
              <Link href="/auth/sign-up">
                <Button className="w-full bg-transparent" variant="outline">
                  Contact Sales
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-6 w-6 text-primary" />
              <span className="font-semibold">StockCheck</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 StockCheck. Professional stock screening platform.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
