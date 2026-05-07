"use client"

import Link from "next/link"
import Image from "next/image"
import { Leaf, Zap, Globe, TrendingUp, Shield, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const HERO_IMAGE = "https://awsimages.detik.net.id/community/media/visual/2022/12/24/ilustrasi-green-economy_169.jpeg?w=600&q=90"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-lg text-foreground">GreenExchange</span>
          </div>
          <Link href="/login">
            <Button variant="default" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">Open Environmental Asset Marketplace</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Modern Trading Platform for Environmental Assets
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              GreenExchange adalah platform perdagangan digital yang dirancang untuk memodernisasi ekosistem Carbon Credit dan Renewable Energy Certificate melalui sistem bursa terbuka yang transparan dan market-driven.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </div>
          
          <div className="relative h-96 rounded-2xl overflow-hidden border border-border shadow-2xl">
            <Image
              src={HERO_IMAGE}
              alt="Green Economy Illustration"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 px-4 bg-secondary/30 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Permasalahan Pasar Saat Ini</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pasar aset lingkungan menghadapi berbagai tantangan struktural yang menghambat pertumbuhan dan aksesibilitas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Globe,
                title: "Bursa Bersifat Tertutup",
                desc: "Akses pasar terbatas bagi organisasi kecil dan individual participant"
              },
              {
                icon: TrendingUp,
                title: "Matching Market Rendah",
                desc: "Supply dan demand sulit bertemu secara efisien"
              },
              {
                icon: Zap,
                title: "Likuiditas Rendah",
                desc: "Aset sulit ditransaksikan cepat karena listing terbatas dan market fragmented"
              },
              {
                icon: Shield,
                title: "Transparansi Rendah",
                desc: "MRV tidak real-time dan potensi greenwashing serta manipulasi valuasi"
              },
            ].map((item, i) => (
              <Card key={i} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg text-foreground">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Solusi GreenExchange</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Platform kami menawarkan solusi komprehensif untuk modernisasi ekosistem perdagangan aset lingkungan
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Bursa Terbuka",
                items: ["Aksesibilitas untuk semua participant", "Voluntary dan compliance market dalam satu platform"]
              },
              {
                title: "Matching Engine Canggih",
                items: ["Listing dan bidding aktif kontinu", "Frekuensi transaksi lebih tinggi"]
              },
              {
                title: "Mekanisme Trading Modern",
                items: ["Order book dan bid/ask mechanism", "Real-time transaction execution"]
              },
              {
                title: "Harga Driven by Market",
                items: ["Valuasi dari supply-demand terbuka", "Transparan dan anti-monopoli"]
              },
              {
                title: "Continuous Quantity Trading",
                items: ["Perdagangan dalam jumlah parsial", "Fleksibel dan accessible"]
              },
              {
                title: "Transparansi Tinggi",
                items: ["Metadata aset terlihat jelas", "Auditability dan traceability penuh"]
              },
            ].map((item, i) => (
              <Card key={i} className="bg-secondary/50 border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {item.items.map((itemText, idx) => (
                      <li key={idx} className="text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {itemText}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/20 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Fitur Platform</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Platform dilengkapi dengan fitur-fitur modern untuk trading yang efisien
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Globe,
                title: "Marketplace Real-Time",
                desc: "Temukan dan perdagangkan aset lingkungan secara real-time"
              },
              {
                icon: TrendingUp,
                title: "Order Book & Matching",
                desc: "Automatic matching dengan market depth dan price priority"
              },
              {
                icon: Shield,
                title: "Portfolio Management",
                desc: "Monitor kepemilikan, average price, dan unrealized PnL"
              },
              {
                icon: Leaf,
                title: "Project Submission",
                desc: "Ajukan project sustainability baru dengan approval workflow"
              },
              {
                icon: Zap,
                title: "Notification System",
                desc: "Real-time notification untuk aktivitas trading dan perubahan"
              },
              {
                icon: TrendingUp,
                title: "Price Analytics",
                desc: "Analisis tren harga dan performa aset historis"
              },
            ].map((item, i) => (
              <Card key={i} className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="p-2 rounded-lg bg-primary/10 w-fit mb-3">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg text-foreground">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Target Users Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Target Pengguna</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              GreenExchange dirancang untuk berbagai kalangan di ekosistem sustainability
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Perusahaan Berbasis Sustainability",
              "Developer Energi Terbarukan",
              "Issuer Carbon Project",
              "ESG Investor",
              "Voluntary Carbon Participant",
              "Compliance Market Entity",
              "Peneliti Lingkungan",
              "Retail Participant",
              "Financial Institution",
            ].map((user, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30 border border-border">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-foreground">{user}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 to-primary/5 border-y border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Siap Bergabung dengan GreenExchange?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Mulai perdagangkan aset lingkungan dalam ekosistem bursa terbuka yang transparan dan market-driven
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Pelajari Lebih Lanjut
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Leaf className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold text-foreground">GreenExchange</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Platform perdagangan aset lingkungan modern
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Marketplace</Link></li>
                <li><Link href="#" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About Us</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="#" className="hover:text-foreground">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 GreenExchange. Building the future of environmental asset trading.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
