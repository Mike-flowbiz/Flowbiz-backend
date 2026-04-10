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
        background: scrollY > 40 ? 'rgba(5,5,15,0.9)' : 'transparent',
        backdropFilter: scrollY > 40 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 40 ? '1px solid rgba(139,92,246,0.12)' : 'none',
        transition: 'all 0.3s ease',
        padding: '0 5vw',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(139,92,246,0.45)',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="9 22 9 12 15 12 15 22" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, background: 'linear-gradient(90deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              FlowBiz
            </span>
          </div>

          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }} className="nav-links-hide">
            {['Features', 'How It Works'].map(link => (
              <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`} style={{
                color: 'rgba(226,232,240,0.6)', fontSize: 15, textDecoration: 'none', fontWeight: 500,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(226,232,240,0.6)')}>
                {link}
              </a>
            ))}
          </div>

          <Link href="/login" style={{
            padding: '10px 24px', borderRadius: 9, fontWeight: 700, fontSize: 14, textDecoration: 'none',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            boxShadow: '0 0 22px rgba(139,92,246,0.4)',
            transition: 'box-shadow 0.2s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 36px rgba(139,92,246,0.65)')}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 22px rgba(139,92,246,0.4)')}>
            Sign In
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', padding: '0 5vw' }}>
        {/* Background */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: '-20%', left: '-10%', width: '70vw', height: '70vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.16) 0%, transparent 70%)',
            transform: `translateY(${scrollY * 0.07}px)`,
          }} />
          <div style={{
            position: 'absolute', top: '10%', right: '-15%', width: '55vw', height: '55vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.13) 0%, transparent 70%)',
            transform: `translateY(${scrollY * -0.04}px)`,
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `
              linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', paddingTop: 140, paddingBottom: 100 }}>
          <div style={{ maxWidth: 720 }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28,
              padding: '6px 16px', borderRadius: 100,
              border: '1px solid rgba(139,92,246,0.35)',
              background: 'rgba(139,92,246,0.08)',
              fontSize: 13, color: '#a78bfa', fontWeight: 500,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#a78bfa', display: 'inline-block', boxShadow: '0 0 8px #a78bfa' }} />
              Your complete business management platform
            </div>

            <h1 style={{ fontSize: 'clamp(40px, 5.5vw, 72px)', fontWeight: 800, lineHeight: 1.08, marginBottom: 26, letterSpacing: '-0.03em' }}>
              <span style={{ color: '#f1f5f9' }}>Run Your Business</span>
              <br />
              <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 45%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Without the Chaos
              </span>
            </h1>

            <p style={{ fontSize: 'clamp(16px, 1.8vw, 19px)', color: 'rgba(226,232,240,0.6)', lineHeight: 1.75, marginBottom: 44, maxWidth: 520 }}>
              FlowBiz centralises invoicing, time tracking, expense management, and your client portal
              — everything your team needs in one place.
            </p>

            <Link href="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '15px 36px', borderRadius: 11, fontWeight: 700, fontSize: 16, textDecoration: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              boxShadow: '0 0 44px rgba(139,92,246,0.45)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 60px rgba(139,92,246,0.65)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 44px rgba(139,92,246,0.45)';
            }}>
              Access Your Dashboard
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>

          {/* Dashboard preview card */}
          <div style={{
            position: 'absolute', right: '5vw', top: '50%', transform: 'translateY(-45%)',
            width: 'clamp(300px, 38vw, 520px)',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(139,92,246,0.18)',
            borderRadius: 20,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }} className="hero-card-hide">
            {/* Window chrome */}
            <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 7 }}>
              {['#ff5f57','#febc2e','#28c840'].map((c, i) => (
                <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />
              ))}
              <div style={{ flex: 1, marginLeft: 10 }}>
                <div style={{ height: 7, width: '55%', borderRadius: 4, background: 'rgba(255,255,255,0.07)' }} />
              </div>
            </div>
            <div style={{ padding: 20 }}>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'Revenue', value: '£24,850', change: '+18%', color: '#818cf8' },
                  { label: 'Invoices', value: '142', change: '+6', color: '#34d399' },
                ].map(s => (
                  <div key={s.label} style={{ padding: '12px 14px', borderRadius: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ fontSize: 10, color: 'rgba(226,232,240,0.4)', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: s.color, marginTop: 2 }}>{s.change} this month</div>
                  </div>
                ))}
              </div>
              {/* Chart */}
              <div style={{ borderRadius: 11, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '14px', marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)', marginBottom: 10 }}>Monthly Revenue</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 52 }}>
                  {[35,55,42,70,58,85,72,90,65,95,80,100].map((h, i) => (
                    <div key={i} style={{ flex: 1, borderRadius: '3px 3px 0 0', height: `${h}%`, background: i === 11 ? 'linear-gradient(180deg, #818cf8, #6366f1)' : 'rgba(99,102,241,0.22)' }} />
                  ))}
                </div>
              </div>
              {/* Recent invoices */}
              <div>
                <div style={{ fontSize: 11, color: 'rgba(226,232,240,0.4)', marginBottom: 8 }}>Recent Invoices</div>
                {[
                  { name: 'Acme Corp', amount: '£1,200', status: 'Paid', c: '#34d399' },
                  { name: 'TechStart Ltd', amount: '£3,400', status: 'Pending', c: '#f59e0b' },
                  { name: 'Nova Media', amount: '£890', status: 'Paid', c: '#34d399' },
                ].map((inv, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(99,102,241,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#818cf8', fontWeight: 700 }}>{inv.name[0]}</div>
                      <span style={{ fontSize: 12, color: 'rgba(226,232,240,0.75)' }}>{inv.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>{inv.amount}</span>
                      <span style={{ fontSize: 10, color: inv.c, background: `${inv.c}18`, padding: '2px 7px', borderRadius: 100 }}>{inv.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(139,92,246,0.1)', borderBottom: '1px solid rgba(139,92,246,0.1)', background: 'rgba(255,255,255,0.015)', padding: '32px 5vw' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 28, textAlign: 'center' }}>
          {[
            { value: '10', label: 'Modules Delivered' },
            { value: '£2,800', label: 'Project Budget' },
            { value: '10 Weeks', label: 'Build Time' },
            { value: '100%', label: 'Milestones Complete' },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: 32, fontWeight: 800, background: 'linear-gradient(135deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(226,232,240,0.4)', marginTop: 6, fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section id="features" style={{ padding: '100px 5vw' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-block', padding: '5px 16px', borderRadius: 100, border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.07)', fontSize: 13, color: '#a78bfa', fontWeight: 500, marginBottom: 18 }}>
              Everything You Need
            </div>
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Six modules.<br />
              <span style={{ background: 'linear-gradient(135deg, #818cf8, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>One platform.</span>
            </h2>
            <p style={{ marginTop: 14, fontSize: 17, color: 'rgba(226,232,240,0.5)', maxWidth: 480, margin: '14px auto 0' }}>
              Everything talks to everything else. No integrations to manage.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 18 }}>
            {features.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '100px 5vw', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-block', padding: '5px 16px', borderRadius: 100, border: '1px solid rgba(96,165,250,0.3)', background: 'rgba(96,165,250,0.07)', fontSize: 13, color: '#60a5fa', fontWeight: 500, marginBottom: 18 }}>
              Workflow
            </div>
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              From setup to{' '}
              <span style={{ background: 'linear-gradient(135deg, #60a5fa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                first invoice in minutes
              </span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
            {[
              { step: '01', title: 'Configure Your Business', desc: 'Set your company info, logo, VAT rate, bank details, and branding in Settings.' },
              { step: '02', title: 'Add Clients & Services', desc: 'Build your client list and product/service catalogue. Both become dropdowns when building invoices.' },
              { step: '03', title: 'Invoice & Get Paid', desc: 'Generate a branded PDF invoice, send it via email, and let clients download it from their own portal.' },
            ].map((step, i) => (
              <div key={i} style={{ padding: '34px 30px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)', position: 'relative' }}>
                <div style={{ fontSize: 48, fontWeight: 900, fontFamily: 'monospace', letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 18, background: 'linear-gradient(135deg, rgba(129,140,248,0.2), rgba(167,139,250,0.05))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {step.step}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(226,232,240,0.52)', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ──────────────────────────────────────────────── */}
      <section style={{ padding: '100px 5vw' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ display: 'inline-block', padding: '5px 16px', borderRadius: 100, border: '1px solid rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.07)', fontSize: 13, color: '#34d399', fontWeight: 500, marginBottom: 18 }}>
              Access Control
            </div>
            <h2 style={{ fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              3 roles.{' '}
              <span style={{ background: 'linear-gradient(135deg, #34d399, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Everyone sees exactly what they need.
              </span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
            {[
              { role: 'Admin', color: '#a78bfa', border: 'rgba(167,139,250,0.3)', bg: 'rgba(167,139,250,0.08)', desc: 'Full access — manages settings, users, all invoices, and business data.', perms: ['Business settings & branding', 'All invoices & clients', 'Products & services', 'Timesheets & expenses', 'Analytics dashboard'] },
              { role: 'Contractor', color: '#60a5fa', border: 'rgba(96,165,250,0.3)', bg: 'rgba(96,165,250,0.08)', desc: 'Operational access — creates and manages their own business records.', perms: ['Own invoices', 'Shared client list', 'Time tracking', 'Expense management', 'Dashboard analytics'] },
              { role: 'Client', color: '#34d399', border: 'rgba(52,211,153,0.3)', bg: 'rgba(52,211,153,0.08)', desc: 'Read-only portal — views and downloads their invoices only.', perms: ['Client portal access', 'View own invoices', 'Download PDF invoices', 'Invoice status tracking'] },
            ].map((r, i) => (
              <div key={i} style={{ padding: '32px 28px', borderRadius: 16, background: r.bg, border: `1px solid ${r.border}`, backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 100, background: `${r.color}22`, border: `1px solid ${r.border}`, fontSize: 13, fontWeight: 700, color: r.color, marginBottom: 14 }}>{r.role}</div>
                <p style={{ fontSize: 14, color: 'rgba(226,232,240,0.55)', lineHeight: 1.65, marginBottom: 20 }}>{r.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {r.perms.map(p => (
                    <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'rgba(226,232,240,0.7)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill={`${r.color}22`}/><path d="M8 12l3 3 5-5" stroke={r.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 5vw' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            borderRadius: 24, padding: '64px 48px', position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.16) 0%, rgba(139,92,246,0.09) 50%, rgba(59,130,246,0.1) 100%)',
            border: '1px solid rgba(139,92,246,0.22)',
            boxShadow: '0 0 100px rgba(99,102,241,0.1)',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)' }} />
            <div style={{ position: 'absolute', bottom: -50, left: -20, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.13) 0%, transparent 70%)' }} />
            <div style={{ position: 'relative' }}>
              <h2 style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 800, color: '#f1f5f9', marginBottom: 14, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Ready to sign in?
              </h2>
              <p style={{ fontSize: 17, color: 'rgba(226,232,240,0.5)', marginBottom: 36 }}>
                Access your dashboard and pick up right where you left off.
              </p>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '15px 40px', borderRadius: 11, fontWeight: 700, fontSize: 16, textDecoration: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white',
                boxShadow: '0 0 44px rgba(139,92,246,0.45)',
              }}>
                Go to Dashboard
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 5vw', color: 'rgba(226,232,240,0.35)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="9 22 9 12 15 12 15 22" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(226,232,240,0.5)' }}>FlowBiz</span>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            {[
              { href: '#features', label: 'Features' },
              { href: '#how-it-works', label: 'How It Works' },
              { href: '/login', label: 'Sign In' },
            ].map(l => (
              <a key={l.label} href={l.href} style={{ fontSize: 13, color: 'rgba(226,232,240,0.35)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#a78bfa')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(226,232,240,0.35)')}>
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
          .nav-links-hide { display: none !important; }
        }
      `}</style>
    </div>
  );
}

const features = [
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    color: '#818cf8',
    title: 'Smart Invoicing',
    desc: 'Auto-numbered invoices with VAT logic, line items, and branded PDF generation — sent straight to clients.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    color: '#34d399',
    title: 'Time Tracking',
    desc: 'Built-in timer and manual entry. Link sessions to clients and export timesheet summaries instantly.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
    color: '#f59e0b',
    title: 'Expense Management',
    desc: 'Log expenses by category, upload receipts to S3, and filter by date range for clean reporting.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    color: '#60a5fa',
    title: 'Client Portal',
    desc: 'Clients get their own login to view, download, and track all their invoices — no chasing needed.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    color: '#a78bfa',
    title: 'Revenue Analytics',
    desc: '6-month revenue chart, pending invoice totals, overdue counts, and a live activity feed.',
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    color: '#f472b6',
    title: 'Role-Based Access',
    desc: 'Admin, Contractor, and Client roles each see exactly what they need — nothing more.',
  },
];

function FeatureCard({ icon, color, title, desc }: { icon: React.ReactNode; color: string; title: string; desc: string }) {
  const [hovered, setHovered] = useState(false);
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '30px',
        borderRadius: 16,
        background: hovered ? `rgba(${r},${g},${b},0.07)` : 'rgba(255,255,255,0.03)',
        border: hovered ? `1px solid rgba(${r},${g},${b},0.32)` : '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.22s ease',
        cursor: 'default',
      }}
    >
      <div style={{
        width: 50, height: 50, borderRadius: 13,
        background: `rgba(${r},${g},${b},0.12)`,
        border: `1px solid rgba(${r},${g},${b},0.22)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 18, color,
        boxShadow: hovered ? `0 0 22px rgba(${r},${g},${b},0.28)` : 'none',
        transition: 'box-shadow 0.22s ease',
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 9 }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'rgba(226,232,240,0.52)', lineHeight: 1.65 }}>{desc}</p>
    </div>
  );
}
