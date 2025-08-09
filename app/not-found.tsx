import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-6xl font-bold text-slate-600 mb-4">404</CardTitle>
          <CardDescription className="text-lg text-slate-600">
            Page Not Found
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-slate-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/">
                Return Home
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/book">
                Book a Room
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
