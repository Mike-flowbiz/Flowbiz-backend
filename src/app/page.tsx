'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ background: '#05050f', color: '#e2e8f0', fontFamily: "'Inter', sans-serif" }}>
      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrollY > 40 ? 'rgba(5,5,15,0.85)' : 'transparent',
        backdropFilter: scrollY > 40 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 40 ? '1px solid rgba(139,92,246,0.15)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 5vw',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(139,92,246,0.5)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="9 22 9 12 15 12 15 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              FlowBiz
            </span>
          </div>

          {/* Nav Links */}
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="hidden-mobile">
            {['Features', 'How It Works', 'Pricing'].map(link => (
              <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`} style={{
                color: 'rgba(226,232,240,0.7)', fontSize: 15, textDecoration: 'none', fontWeight: 500,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(226,232,240,0.7)')}>
                {link}
              </a>
            ))}
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/login" style={{
              padding: '9px 20px', borderRadius: 8, color: 'rgba(226,232,240,0.85)',
              fontWeight: 500, fontSize: 14, textDecoration: 'none',
              border: '1px solid rgba(139,92,246,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(139,92,246,0.8)';
              (e.currentTarget as HTMLAnchorElement).style.color = '#a78bfa';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(139,92,246,0.3)';
              (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(226,232,240,0.85)';
            }}>
              Sign In
            </Link>
            <Link href="/register" style={{
              padding: '9px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              boxShadow: '0 0 20px rgba(139,92,246,0.35)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 30px rgba(139,92,246,0.6)')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 20px rgba(139,92,246,0.35)')}>
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '0 5vw' }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: '-20%', left: '-10%', width: '70vw', height: '70vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
            transform: `translateY(${scrollY * 0.08}px)`,
          }} />
          <div style={{
            position: 'absolute', top: '10%', right: '-15%', width: '60vw', height: '60vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            transform: `translateY(${scrollY * -0.05}px)`,
          }} />
          <div style={{
            position: 'absolute', bottom: '-10%', left: '30%', width: '50vw', height: '50vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
          }} />
          {/* Grid pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `
              linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', paddingTop: 120, paddingBottom: 80 }}>
          <div style={{ maxWidth: 800 }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28,
              padding: '6px 16px', borderRadius: 100,
              border: '1px solid rgba(139,92,246,0.4)',
              background: 'rgba(139,92,246,0.08)',
              fontSize: 13, color: '#a78bfa', fontWeight: 500,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#a78bfa', display: 'inline-block', boxShadow: '0 0 8px #a78bfa' }} />
              All 10 Milestones Complete — Production Ready
            </div>

            <h1 style={{ fontSize: 'clamp(42px, 6vw, 76px)', fontWeight: 800, lineHeight: 1.08, marginBottom: 28, letterSpacing: '-0.03em' }}>
              <span style={{ color: '#f1f5f9' }}>Run Your Business</span>
              <br />
              <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Without the Chaos
              </span>
            </h1>

            <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(226,232,240,0.65)', lineHeight: 1.7, marginBottom: 44, maxWidth: 560 }}>
              FlowBiz brings invoicing, time tracking, expense management, and a client portal
              into one unified platform — so you stay in flow, not spreadsheets.
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Link href="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                boxShadow: '0 0 40px rgba(139,92,246,0.4)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)')}>
                Start Free Trial
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none',
                color: 'rgba(226,232,240,0.85)',
                border: '1px solid rgba(226,232,240,0.15)',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(139,92,246,0.5)')}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(226,232,240,0.15)')}>
                View Demo
              </Link>
            </div>

            {/* Social proof */}
            <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex' }}>
                  {['#6366f1','#8b5cf6','#a78bfa','#818cf8','#60a5fa'].map((c, i) => (
                    <div key={i} style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${c}, #0d0d1a)`,
                      border: '2px solid #05050f',
                      marginLeft: i === 0 ? 0 : -8,
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 14, color: 'rgba(226,232,240,0.55)' }}>
                  Trusted by <strong style={{ color: 'rgba(226,232,240,0.85)' }}>500+</strong> businesses
                </span>
              </div>
              <div style={{ width: 1, height: 20, background: 'rgba(226,232,240,0.12)' }} />
              <div style={{ display: 'flex', gap: 4 }}>
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
              <span style={{ fontSize: 14, color: 'rgba(226,232,240,0.55)' }}>4.9/5 rating</span>
            </div>
          </div>

          {/* Dashboard preview card */}
          <div style={{
            position: 'absolute', right: '5vw', top: '50%', transform: 'translateY(-45%)',
            width: 'clamp(320px, 40vw, 540px)',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: 20,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }} className="hero-card-hide">
            {/* Fake window chrome */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
              {['#ff5f57','#febc2e','#28c840'].map((c, i) => (
                <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
              ))}
              <div style={{ flex: 1, marginLeft: 12 }}>
                <div style={{ height: 8, width: '60%', borderRadius: 4, background: 'rgba(255,255,255,0.08)' }} />
              </div>
            </div>

            {/* Fake dashboard content */}
            <div style={{ padding: 20 }}>
              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Revenue', value: '£24,850', change: '+18%', color: '#818cf8' },
                  { label: 'Invoices', value: '142', change: '+6', color: '#34d399' },
                ].map(s => (
                  <div key={s.label} style={{
                    padding: '14px 16px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}>
                    <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.45)', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: s.color, marginTop: 2 }}>{s.change} this month</div>
                  </div>
                ))}
              </div>

              {/* Fake chart */}
              <div style={{
                borderRadius: 12, background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '16px', marginBottom: 16,
              }}>
                <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.45)', marginBottom: 12 }}>Monthly Revenue</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
                  {[35, 55, 42, 70, 58, 85, 72, 90, 65, 95, 80, 100].map((h, i) => (
                    <div key={i} style={{ flex: 1, borderRadius: '3px 3px 0 0', height: `${h}%`, background: i === 11 ? 'linear-gradient(180deg, #818cf8, #6366f1)' : 'rgba(99,102,241,0.25)' }} />
                  ))}
                </div>
              </div>

              {/* Recent invoices */}
              <div>
                <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.45)', marginBottom: 10 }}>Recent Invoices</div>
                {[
                  { name: 'Acme Corp', amount: '£1,200', status: 'Paid', statusColor: '#34d399' },
                  { name: 'TechStart Ltd', amount: '£3,400', status: 'Pending', statusColor: '#f59e0b' },
                  { name: 'Nova Media', amount: '£890', status: 'Paid', statusColor: '#34d399' },
                ].map((inv, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#818cf8', fontWeight: 700 }}>
                        {inv.name[0]}
                      </div>
                      <span style={{ fontSize: 13, color: 'rgba(226,232,240,0.8)' }}>{inv.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{inv.amount}</span>
                      <span style={{ fontSize: 11, color: inv.statusColor, background: `${inv.statusColor}18`, padding: '2px 8px', borderRadius: 100 }}>{inv.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(139,92,246,0.1)', borderBottom: '1px solid rgba(139,92,246,0.1)', background: 'rgba(255,255,255,0.015)', padding: '36px 5vw' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, textAlign: 'center' }}>
          {[
            { value: '500+', label: 'Businesses' },
            { value: '£2M+', label: 'Invoiced' },
            { value: '10K+', label: 'Hours Tracked' },
            { value: '99.9%', label: 'Uptime' },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: 36, fontWeight: 800, background: 'linear-gradient(135deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 14, color: 'rgba(226,232,240,0.45)', marginTop: 6, fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 5vw' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', padding: '5px 16px', borderRadius: 100, border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.07)', fontSize: 13, color: '#a78bfa', fontWeight: 500, marginBottom: 20 }}>
              Everything You Need
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Built for Freelancers &<br />
              <span style={{ background: 'linear-gradient(135deg, #818cf8, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Growing Businesses</span>
            </h2>
            <p style={{ marginTop: 16, fontSize: 18, color: 'rgba(226,232,240,0.55)', maxWidth: 520, margin: '16px auto 0' }}>
              Six powerful modules, one coherent platform. Everything talks to everything else.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {[
              {
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                ),
                color: '#818cf8',
                title: 'Smart Invoicing',
                desc: 'Create branded invoices with auto-numbering, VAT logic, and instant PDF generation — sent directly to clients.',
              },
              {
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                ),
                color: '#34d399',
                title: 'Time Tracking',
                desc: 'Start a timer or log hours manually. Link sessions to clients and generate timesheet summaries in seconds.',
              },
              {
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                ),
                color: '#f59e0b',
                title: 'Expense Management',
                desc: 'Categorise expenses, upload receipts to S3, and get a clear picture of your outgoings each month.',
              },
              {
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                ),
                color: '#60a5fa',
                title: 'Client Portal',
                desc: 'Give clients their own login to view, download, and track all their invoices — no chasing required.',
              },
              {
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                ),
                color: '#a78bfa',
                title: 'Revenue Analytics',
                desc: 'Live dashboard with monthly revenue graphs, activity feeds, and business performance metrics at a glance.',
              },
              {
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                ),
                color: '#f472b6',
                title: 'Role-Based Access',
                desc: 'Admins, contractors, and clients each see exactly what they need — nothing more, nothing less.',
              },
            ].map((feature, i) => (
              <FeatureCard key={i} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '100px 5vw', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', padding: '5px 16px', borderRadius: 100, border: '1px solid rgba(96,165,250,0.3)', background: 'rgba(96,165,250,0.07)', fontSize: 13, color: '#60a5fa', fontWeight: 500, marginBottom: 20 }}>
              Simple Setup
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Up and running in{' '}
              <span style={{ background: 'linear-gradient(135deg, #60a5fa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                minutes
              </span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, position: 'relative' }}>
            {[
              { step: '01', title: 'Create Your Account', desc: 'Register in seconds. Set up your company info, logo, bank details, and branding colours in the settings panel.' },
              { step: '02', title: 'Add Clients & Services', desc: 'Build your client list and product/service catalogue. Everything becomes a dropdown when you build invoices.' },
              { step: '03', title: 'Send & Get Paid', desc: 'Generate a branded PDF invoice, send it via email, and let clients access it through their own portal.' },
            ].map((step, i) => (
              <div key={i} style={{
                position: 'relative',
                padding: '36px 32px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(10px)',
              }}>
                <div style={{
                  fontSize: 52, fontWeight: 900, letterSpacing: '-0.05em',
                  background: 'linear-gradient(135deg, rgba(129,140,248,0.15), rgba(167,139,250,0.05))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  lineHeight: 1, marginBottom: 20,
                  fontFamily: 'monospace',
                }}>
                  {step.step}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>{step.title}</h3>
                <p style={{ fontSize: 15, color: 'rgba(226,232,240,0.55)', lineHeight: 1.65 }}>{step.desc}</p>

                {i < 2 && (
                  <div style={{
                    position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)',
                    zIndex: 1, color: 'rgba(139,92,246,0.4)', fontSize: 20,
                  }} className="step-arrow-hide">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────── */}
      <section style={{ padding: '100px 5vw' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              What our users say
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {[
              { name: 'Sarah K.', role: 'Freelance Designer', quote: 'I used to spend hours at month-end chasing invoices. FlowBiz automated all of that. The client portal is a game-changer — clients can just log in and download what they need.', avatar: 'SK' },
              { name: 'James M.', role: 'Contractor (Dev)', quote: 'The time tracker + invoice link is seamlessly integrated. I clock off, export a timesheet, and attach it to the invoice — all in under 60 seconds. Absolutely love it.', avatar: 'JM' },
              { name: 'Priya T.', role: 'Agency Director', quote: "We manage 30+ contractors with FlowBiz. Role-based access means everyone sees exactly what they need. The analytics dashboard keeps our finance team happy too.", avatar: 'PT' },
            ].map((t, i) => (
              <div key={i} style={{
                padding: '32px', borderRadius: 16,
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(10px)',
              }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                  {[1,2,3,4,5].map(s => <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                </div>
                <p style={{ fontSize: 15, color: 'rgba(226,232,240,0.7)', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: 'white',
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(226,232,240,0.45)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '100px 5vw', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', padding: '5px 16px', borderRadius: 100, border: '1px solid rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.07)', fontSize: 13, color: '#34d399', fontWeight: 500, marginBottom: 20 }}>
              Simple Pricing
            </div>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              One plan. Everything included.
            </h2>
            <p style={{ marginTop: 16, fontSize: 18, color: 'rgba(226,232,240,0.55)' }}>No feature gates. No per-seat pricing. Just a flat monthly fee.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 900, margin: '0 auto' }}>
            {[
              {
                name: 'Starter',
                price: '£19',
                period: '/month',
                desc: 'Perfect for solo freelancers',
                features: ['5 Clients', 'Unlimited Invoices', 'Time Tracking', 'Expense Management', 'PDF Generation', 'Client Portal'],
                cta: 'Get Started',
                highlight: false,
              },
              {
                name: 'Professional',
                price: '£49',
                period: '/month',
                desc: 'For agencies and teams',
                features: ['Unlimited Clients', 'Unlimited Invoices', 'Time Tracking', 'Expense Management', 'PDF Generation', 'Client Portal', 'Analytics Dashboard', 'Role-Based Access', 'Priority Support'],
                cta: 'Start Free Trial',
                highlight: true,
              },
            ].map((plan, i) => (
              <div key={i} style={{
                padding: '36px 32px',
                borderRadius: 20,
                background: plan.highlight ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))' : 'rgba(255,255,255,0.03)',
                border: plan.highlight ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.07)',
                boxShadow: plan.highlight ? '0 0 60px rgba(139,92,246,0.15)' : 'none',
                position: 'relative',
              }}>
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    padding: '4px 16px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white',
                  }}>
                    Most Popular
                  </div>
                )}
                <div style={{ fontSize: 16, fontWeight: 600, color: plan.highlight ? '#a78bfa' : 'rgba(226,232,240,0.6)', marginBottom: 8 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 48, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.04em' }}>{plan.price}</span>
                  <span style={{ fontSize: 16, color: 'rgba(226,232,240,0.45)' }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: 14, color: 'rgba(226,232,240,0.45)', marginBottom: 28 }}>{plan.desc}</p>
                <Link href="/register" style={{
                  display: 'block', textAlign: 'center', padding: '13px', borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: 'none',
                  background: plan.highlight ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                  color: plan.highlight ? 'white' : 'rgba(226,232,240,0.85)',
                  border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  boxShadow: plan.highlight ? '0 0 30px rgba(139,92,246,0.3)' : 'none',
                  marginBottom: 28,
                }}>
                  {plan.cta}
                </Link>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(226,232,240,0.7)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill={plan.highlight ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)'}/>
                        <path d="M8 12l3 3 5-5" stroke={plan.highlight ? '#818cf8' : '#34d399'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────────── */}
      <section style={{ padding: '80px 5vw' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{
            borderRadius: 24,
            padding: '64px 48px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.1) 50%, rgba(59,130,246,0.12) 100%)',
            border: '1px solid rgba(139,92,246,0.25)',
            boxShadow: '0 0 100px rgba(99,102,241,0.12)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -30, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }} />

            <div style={{ position: 'relative' }}>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: '#f1f5f9', marginBottom: 16, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Ready to get your business<br />
                <span style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  in flow?
                </span>
              </h2>
              <p style={{ fontSize: 18, color: 'rgba(226,232,240,0.55)', marginBottom: 40 }}>
                Join 500+ businesses already using FlowBiz. No credit card required.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                <Link href="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '15px 36px', borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: 'none',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  boxShadow: '0 0 40px rgba(139,92,246,0.45)',
                }}>
                  Start Free Trial
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <Link href="/login" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '15px 36px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none',
                  color: 'rgba(226,232,240,0.85)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.04)',
                }}>
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 5vw', color: 'rgba(226,232,240,0.4)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="9 22 9 12 15 12 15 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(226,232,240,0.6)' }}>FlowBiz</span>
          </div>

          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[
              { href: '#features', label: 'Features' },
              { href: '#how-it-works', label: 'How It Works' },
              { href: '#pricing', label: 'Pricing' },
              { href: '/login', label: 'Sign In' },
              { href: '/register', label: 'Register' },
            ].map(l => (
              <a key={l.label} href={l.href} style={{ fontSize: 14, color: 'rgba(226,232,240,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(226,232,240,0.4)')}>
                {l.label}
              </a>
            ))}
          </div>

          <div style={{ fontSize: 13 }}>© 2026 FlowBiz. All rights reserved.</div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 900px) {
          .hero-card-hide { display: none !important; }
          .hidden-mobile { display: none !important; }
          .step-arrow-hide { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function FeatureCard({ icon, color, title, desc }: { icon: React.ReactNode; color: string; title: string; desc: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '32px',
        borderRadius: 16,
        background: hovered ? `rgba(${hexToRgb(color)},0.07)` : 'rgba(255,255,255,0.03)',
        border: hovered ? `1px solid rgba(${hexToRgb(color)},0.35)` : '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.25s ease',
        cursor: 'default',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: `rgba(${hexToRgb(color)},0.12)`,
        border: `1px solid rgba(${hexToRgb(color)},0.25)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, color,
        boxShadow: hovered ? `0 0 24px rgba(${hexToRgb(color)},0.3)` : 'none',
        transition: 'box-shadow 0.25s ease',
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'rgba(226,232,240,0.55)', lineHeight: 1.65 }}>{desc}</p>
    </div>
  );
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
