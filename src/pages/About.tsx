import PageLayout from "@/components/layout/PageLayout";
import BlobShape from "@/components/ui/blob-shape";
import { Card, CardContent } from "@/components/ui/card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Link } from "react-router-dom";
import { Award, Users, Heart, Target, TrendingUp, Shield, Sparkles, Globe } from "lucide-react";
import { DecorativeAvatar } from "@/components/shared/DecorativeAvatar";

const About = () => {
  const values = [
    {
      icon: Award,
      title: "Excellence",
      description: "We partner only with verified, top-tier coaches who have proven track records of transforming lives."
    },
    {
      icon: Users,
      title: "Accessibility",
      description: "Fitness coaching for every budget and schedule. Everyone deserves access to expert guidance."
    },
    {
      icon: Heart,
      title: "Community",
      description: "Building meaningful connections that motivate, inspire, and support your fitness journey."
    },
    {
      icon: Target,
      title: "Results",
      description: "Data-driven approach focused on measurable outcomes and sustainable transformation."
    }
  ];

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "500+", label: "Expert Coaches" },
    { value: "50K+", label: "Sessions Completed" },
    { value: "98%", label: "Satisfaction Rate" }
  ];

  const team = [
    {
      name: "Sarah Mitchell",
      role: "CEO & Co-Founder",
      bio: "Former Olympic athlete with 15 years in fitness industry"
    },
    {
      name: "Marcus Chen",
      role: "CTO & Co-Founder",
      bio: "Tech entrepreneur passionate about health innovation"
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Head of Coach Success",
      bio: "Sports psychologist and certified strength coach"
    },
    {
      name: "James Okonkwo",
      role: "Head of Community",
      bio: "Former personal trainer with 10K+ client sessions"
    }
  ];

  return (
    <PageLayout
      title="About Us"
      description="Learn about FitConnect's mission to make personalized fitness coaching accessible to everyone. Meet our team and discover our story."
    >
      {/* Decorative Avatars */}
      <DecorativeAvatar 
        avatarSlug="weightlifting-lion" 
        position="top-right" 
        size="lg" 
        opacity={18}
        className="right-8 top-40 z-0"
      />
      <DecorativeAvatar 
        avatarSlug="strongman-bear" 
        position="bottom-left" 
        size="md" 
        opacity={15}
        className="left-8 bottom-60 z-0"
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <BlobShape className="absolute -top-40 -right-40 w-[600px] h-[600px] opacity-30" variant="pink" />
          <BlobShape className="absolute -bottom-40 -left-40 w-[500px] h-[500px] opacity-20" variant="teal" />
        </div>
        
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
            Our Story
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transforming Lives Through{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Expert Coaching
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We believe everyone deserves access to world-class fitness coaching. 
            FitConnect bridges the gap between ambitious individuals and the coaches who can help them achieve their dreams.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                How It All{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Started
                </span>
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2024, FitConnect was born from a simple observation: while incredible fitness coaches exist everywhere, 
                  finding the right match remains frustratingly difficult for most people.
                </p>
                <p>
                  Our founders, Sarah and Marcus, experienced this firsthand. Sarah, a former Olympic athlete turned coach, 
                  struggled to reach clients beyond her local gym. Marcus, a busy tech entrepreneur, couldn't find a coach 
                  who understood his schedule constraints and specific goals.
                </p>
                <p>
                  Together, they built FitConnect—a platform that uses smart matching technology to connect clients with 
                  coaches who truly fit their needs, whether that's a nutritionist for meal planning, a personal trainer 
                  for strength goals, or a boxing coach for stress relief.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
                  <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Est. 2024
                  </p>
                  <p className="text-muted-foreground">San Francisco, CA</p>
                </div>
              </div>
              <BlobShape className="absolute -bottom-10 -right-10 w-40 h-40 opacity-50" variant="orange" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Globe className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-2xl text-muted-foreground leading-relaxed">
              "To make personalized fitness coaching{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">
                accessible, affordable, and effective
              </span>{" "}
              for everyone, regardless of location, budget, or experience level."
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Core Values
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do at FitConnect
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-soft bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <BlobShape className="absolute top-0 left-1/4 w-[400px] h-[400px] opacity-20" variant="pink" />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet Our{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Leadership
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Passionate experts dedicated to revolutionizing fitness coaching
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-soft bg-card/80 backdrop-blur-sm overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="aspect-square bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-bold mb-1">{member.name}</h3>
                  <p className="text-primary text-sm font-medium mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-start gap-6">
                  <div className="hidden md:block">
                    <Shield className="w-16 h-16 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Your Trust, Our Priority</h3>
                    <p className="text-muted-foreground mb-4">
                      Every coach on FitConnect undergoes rigorous verification including credential checks, 
                      background screening, and ongoing performance monitoring. We maintain the highest standards 
                      so you can focus on what matters—your fitness journey.
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Verified certifications and credentials
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Comprehensive background checks
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Ongoing quality monitoring and reviews
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Secure payment and data protection
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join the FitConnect{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Community
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Whether you're looking to transform your body, improve your health, or grow your coaching business, 
            FitConnect is here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/coaches">
              <GradientButton size="lg">Find Your Coach</GradientButton>
            </Link>
            <Link to="/for-coaches">
              <GradientButton size="lg" variant="outline">Become a Coach</GradientButton>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default About;
