import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Ruler, Sparkles, Wand2, Grid, ChevronLeft, ChevronRight, CheckCircle, LogIn, LogOut, Save, Upload, User, SlidersHorizontal } from 'lucide-react';

import { supabase } from './lib/supabaseClient';

function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [session, setSession] = useState(null);
  const [designState, setDesignState] = useState({
    color: '#1A1A1A',
    fabric: 'Linen',
    name: 'AI Pending...',
    features: [],
    gender: null,
    prompt: '',
    isGenerating: false,
    step: 0,
    manual: {
      type: 'Casual',
      colorName: 'Midnight Black',
      customColor: '#000000',
      fabric: 'Silk',
      pattern: 'Plain',
      sleeves: 'Full',
      measurements: {
        chest: '',
        waist: '',
        shoulder: ''
      }
    },
    photoUrl: null
  });

  const [isSizingModalOpen, setIsSizingModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setActiveTab('landing');
  };

  const navigateTo = (tab) => {
    if (['studio', 'collection'].includes(tab) && !session) {
      setActiveTab('login');
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-pure-white text-charcoal font-inter pb-20">
      <header className="px-8 py-6 w-full flex justify-between items-center border-b border-gray-100 sticky top-0 bg-white z-50">
        <div className="text-2xl font-bold tracking-tighter flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('landing')}>
          <Scissors className="text-gold" /> MACAO
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-500 items-center">
          <button onClick={() => navigateTo('landing')} className={`transition-colors ${activeTab === 'landing' ? 'text-charcoal' : 'hover:text-charcoal'}`}>Vision</button>
          <button onClick={() => navigateTo('studio')} className={`transition-colors flex items-center gap-1 ${activeTab === 'studio' ? 'text-charcoal' : 'hover:text-charcoal'}`}>Studio</button>
          <button onClick={() => navigateTo('collection')} className={`transition-colors flex items-center gap-1 ${activeTab === 'collection' ? 'text-charcoal' : 'hover:text-charcoal'}`}>
            <Grid size={16} /> Showcase
          </button>

          {session ? (
            <button onClick={handleSignOut} className="ml-4 text-xs uppercase tracking-wider font-semibold hover:text-gold transition-colors flex items-center gap-1"><LogOut size={14} /> Sign Out</button>
          ) : (
            <button onClick={() => navigateTo('login')} className="ml-4 bg-charcoal text-white px-4 py-2 rounded-full hover:bg-black transition-colors flex items-center gap-1"><LogIn size={16} /> Sign In</button>
          )}
        </nav>
      </header>

      <main className="w-full relative">
        {activeTab === 'landing' && <LandingHero onStart={() => navigateTo('studio')} />}
        {activeTab === 'login' && <Login />}
        {activeTab === 'studio' && (
          <Studio
            session={session}
            designState={designState}
            setDesignState={setDesignState}
          />
        )}
        {activeTab === 'collection' && <Collection session={session} />}
      </main>
    </div>
  );
}

function LandingHero({ onStart }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-6 pt-32 pb-20 text-center"
    >
      <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-charcoal mb-6">
        Your Fit, <span className="text-gold">Your Design</span>,<br /> Powered by AI.
      </h1>
      <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
        Experience the future of custom apparel. Minimalist luxury meets artificial intelligence.
      </p>
      <button
        onClick={onStart}
        className="bg-charcoal text-white px-8 py-4 rounded-full text-lg font-medium inline-flex items-center gap-2 hover:bg-black transition-colors shadow-xl"
      >
        <Sparkles size={20} /> Start Designing
      </button>
    </motion.section>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });
    setLoading(false);
    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Check your email for the login link!");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto px-6 py-24 text-center"
    >
      <div className="bg-white border flex flex-col items-center border-gray-100 rounded-[2.5rem] p-10 shadow-lg">
        <Scissors className="text-gold w-12 h-12 mb-6" />
        <h2 className="text-3xl font-bold tracking-tighter text-charcoal mb-2">Welcome Back</h2>
        <p className="text-gray-500 mb-8 text-sm">Sign in to sync your bespoke creations.</p>

        <form onSubmit={handleEmailLogin} className="w-full mb-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 mb-3 focus:ring-2 focus:ring-gold outline-none text-charcoal text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-charcoal text-white py-3 rounded-2xl font-medium tracking-wider flex justify-center items-center gap-2 hover:bg-black transition-all shadow border border-transparent disabled:opacity-50"
          >
            {loading ? "Sending link..." : "Email Magic Link"}
          </button>
        </form>

        {message && <p className="text-sm font-medium mb-4 text-gold">{message}</p>}

        <div className="flex items-center w-full mb-4 gap-2">
          <div className="flex-1 h-px bg-gray-100"></div>
          <span className="text-xs text-gray-400 uppercase">or</span>
          <div className="flex-1 h-px bg-gray-100"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white text-charcoal border border-gray-200 py-3 rounded-2xl font-medium tracking-wider flex justify-center items-center gap-3 hover:bg-gray-50 transition-all shadow-sm hover:shadow"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>
      </div>
    </motion.section>
  );
}

const ManSilhouette = () => (
  <svg viewBox="0 0 100 160" className="w-[80%] h-auto drop-shadow-2xl opacity-90 transition-all duration-300">
    <path d="M35 15 C35 5, 65 5, 65 15 L85 30 C90 35, 95 45, 95 60 L80 50 L80 120 L55 120 L55 140 L45 140 L45 120 L20 120 L20 50 L5 60 C5 45, 10 35, 15 30 Z" fill="currentColor" />
    <path d="M42 15 L50 35 L58 15 Z" fill="white" opacity="0.15" />
    <path d="M50 35 L48 100 L52 100 Z" fill="black" opacity="0.15" />
  </svg>
);

const WomanSilhouette = () => (
  <svg viewBox="0 0 100 160" className="w-[80%] h-auto drop-shadow-2xl opacity-90 transition-all duration-300">
    <path d="M38 15 C38 5, 62 5, 62 15 C65 25, 75 30, 80 40 C70 45, 65 40, 60 55 C65 90, 85 130, 90 145 C90 150, 10 150, 10 145 C15 130, 35 90, 40 55 C35 40, 30 45, 20 40 C25 30, 35 25, 38 15 Z" fill="currentColor" />
    <path d="M40 55 C40 40, 60 40, 60 55 C60 70, 40 70, 40 55 Z" fill="black" opacity="0.1" />
  </svg>
);

function Studio({ session, designState, setDesignState }) {
  const [isSaving, setIsSaving] = useState(false);

  const nextStep = (updates = {}) => {
    setDesignState(prev => ({ ...prev, ...updates, step: prev.step + 1 }));
  };

  const setManualField = (field, value) => {
    setDesignState(prev => ({ ...prev, manual: { ...prev.manual, [field]: value } }));
  };

  // Generic AI Call handler (Data + Image)
  const generateWithAI = async (prompt, gender) => {
    const apiKey = import.meta.env.VITE_AI_API_KEY;
    if (!apiKey) {
      // Fallback if no key is present (simulate longer waiting for image)
      await new Promise(r => setTimeout(r, 4000));
      return {
        name: 'AI Generated (Fallback)',
        color: designState.manual?.colorName === 'Custom' ? designState.manual?.customColor : '#1E1E1E',
        fabric: designState.manual?.fabric || 'Smart Blend',
        features: ['AI Tailored Fit', 'Enhanced Lining', 'Premium Stitching'],
        imageUrl: gender === 'woman' ? '/fallback_woman.png' : '/fallback_man.png'
      };
    }
    
    try {
      const textReq = fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an AI Fashion Designer. Given a prompt, return a JSON object with this exact structure: { "name": "Catchy Outfit Name", "color": "#HEXCode", "fabric": "Fabric Name", "features": ["Feature 1", "Feature 2", "Feature 3"] }. DO NOT wrap in markdown.' },
            { role: 'user', content: prompt }
          ]
        })
      });

      const imgReq = fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `A photorealistic, high fashion editorial photograph of a luxurious ${prompt}. Completely isolated on a clean white background. High end dramatic studio lighting.`,
          n: 1,
          size: "1024x1024"
        })
      });

      const [textRes, imgRes] = await Promise.all([textReq, imgReq]);
      const textData = await textRes.json();
      const imgData = await imgRes.json();

      let content = textData.choices[0].message.content;
      if (content.startsWith('```json')) content = content.replace(/```json/g, '').replace(/```/g, '');
      const aiResponse = JSON.parse(content);
      aiResponse.imageUrl = imgData.data?.[0]?.url || (gender === 'woman' ? '/fallback_woman.png' : '/fallback_man.png');
      return aiResponse;
    } catch (e) {
      console.error(e);
      return { name: 'Generation Failed', color: '#000000', fabric: 'Unknown', features: ['Error'], imageUrl: gender === 'woman' ? '/fallback_woman.png' : '/fallback_man.png' };
    }
  };

  const handleManualGenerate = async () => {
    setDesignState(prev => ({ ...prev, step: 3, isGenerating: true }));
    
    const { manual, gender } = designState;
    const prompt = `Design a ${gender} outfit. Type: ${manual.type}. Color: ${manual.colorName === 'Custom' ? manual.customColor : manual.colorName}. Fabric: ${manual.fabric}. Pattern: ${manual.pattern}. Sleeves: ${manual.sleeves}. Measurements (cm/in): ${JSON.stringify(manual.measurements)}. Make it luxurious and bespoke.`;
    
    const aiResult = await generateWithAI(prompt, gender);

    setDesignState(prev => ({
      ...prev,
      step: 4,
      isGenerating: false,
      name: aiResult.name,
      fabric: aiResult.fabric,
      color: aiResult.color,
      features: aiResult.features,
      imageUrl: aiResult.imageUrl
    }));
  };

  const handlePhotoGenerate = async () => {
    setDesignState(prev => ({ ...prev, step: 3, isGenerating: true }));
    
    const prompt = `Design a luxurious ${designState.gender} outfit based on an uploaded photo. Ensure it enhances their skin tone and proportions.`;
    const aiResult = await generateWithAI(prompt, designState.gender);

    setDesignState(prev => ({
      ...prev,
      step: 4,
      isGenerating: false,
      name: aiResult.name,
      fabric: aiResult.fabric,
      color: aiResult.color,
      features: aiResult.features,
      imageUrl: aiResult.imageUrl
    }));
  };

  const handlePhotoUpload = (e) => {
    e.preventDefault();
    // Simulate finding a file
    setDesignState(prev => ({ ...prev, photoUrl: 'uploaded' }));
  };

  const handleSaveToProfile = async () => {
    if (!session?.user) return;
    setIsSaving(true);
    const { error } = await supabase.from('designs').insert({
      user_id: session.user.id,
      design_name: designState.name !== 'AI Pending...' ? designState.name : 'Draft Design',
      hex_code: designState.color,
      fabric_type: designState.fabric || 'Cotton',
      measurements: {}
    });
    setIsSaving(false);
    if (!error) {
      alert("Design safely stored to your Showcase database!");
    } else {
      alert("Error saving design. " + error.message);
    }
  };

  if (designState.step === 0) {
    return (
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-charcoal mb-4">Who are we designing for?</h2>
        <p className="text-gray-400 mb-12">Select to perfectly calibrate the AI silhouette base.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button onClick={() => nextStep({ gender: 'woman' })} className="group relative bg-gray-50 border border-gray-100 rounded-[2rem] p-12 hover:bg-white hover:shadow-2xl hover:border-gold/30 transition-all">
            <User size={48} className="mx-auto mb-6 text-gray-300 group-hover:text-gold transition-colors" />
            <h3 className="text-2xl font-bold text-charcoal mb-2">Women</h3>
            <p className="text-sm text-gray-500">Female silhouette & proportions</p>
          </button>
          <button onClick={() => nextStep({ gender: 'man' })} className="group relative bg-gray-50 border border-gray-100 rounded-[2rem] p-12 hover:bg-white hover:shadow-2xl hover:border-gold/30 transition-all">
            <User size={48} className="mx-auto mb-6 text-gray-300 group-hover:text-gold transition-colors" />
            <h3 className="text-2xl font-bold text-charcoal mb-2">Men</h3>
            <p className="text-sm text-gray-500">Male silhouette & proportions</p>
          </button>
        </div>
      </motion.section>
    );
  }

  if (designState.step === 1) {
    return (
      <motion.section initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto px-6 py-20 text-center">
        <button onClick={() => setDesignState(p => ({...p, step: p.step - 1}))} className="text-gray-400 hover:text-charcoal mb-8 inline-flex items-center gap-2"><ChevronLeft size={16}/> Back</button>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-charcoal mb-4">How do you want to create?</h2>
        <p className="text-gray-400 mb-12">Choose manual input or let our AI analyze your features.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button onClick={() => setDesignState(p => ({...p, step: 2, hasPreference: true}))} className="group bg-gray-50 border border-gray-100 rounded-[2rem] p-10 hover:shadow-xl transition-all text-left">
            <SlidersHorizontal size={32} className="text-charcoal mb-6" />
            <h3 className="text-xl font-bold text-charcoal mb-2">I have preferences</h3>
            <p className="text-sm text-gray-500">Manually select your fabric, color, type of wear, and style.</p>
          </button>
          <button onClick={() => setDesignState(p => ({...p, step: 2, hasPreference: false}))} className="group bg-charcoal text-white border border-transparent rounded-[2rem] p-10 hover:shadow-xl hover:bg-black transition-all text-left relative overflow-hidden">
            <Sparkles size={32} className="text-gold mb-6" />
            <h3 className="text-xl font-bold mb-2">Style me with AI</h3>
            <p className="text-sm text-gray-400">Upload a photo. The AI will suggest outfits based on your skin tone and body type.</p>
          </button>
        </div>
      </motion.section>
    );
  }

  if (designState.step === 2 && designState.hasPreference) {
    return (
      <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-3xl mx-auto px-6 py-16">
        <button onClick={() => setDesignState(p => ({...p, step: 1}))} className="text-gray-400 hover:text-charcoal mb-8 inline-flex items-center gap-2"><ChevronLeft size={16}/> Back</button>
        <h2 className="text-3xl font-bold tracking-tighter text-charcoal mb-8">Design Parameters</h2>
        <div className="bg-white border flex flex-col gap-6 border-gray-100 rounded-[2rem] p-8 shadow-sm">
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Wear Type</label>
              <select value={designState.manual.type} onChange={e => setManualField('type', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gold appearance-none">
                <option>Casual</option>
                <option>Business Suit</option>
                <option>Tuxedo</option>
                <option>Evening Gown</option>
                <option>Overcoat</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Color Palette</label>
              <div className="flex gap-2 items-center">
                <select value={designState.manual.colorName} onChange={e => setManualField('colorName', e.target.value)} className="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gold appearance-none">
                  <option>Midnight Black</option>
                  <option>Ocean Blue</option>
                  <option>Ruby Red</option>
                  <option>Emerald Green</option>
                  <option>Cream White</option>
                  <option>Custom</option>
                </select>
                {designState.manual.colorName === 'Custom' && (
                  <input type="color" value={designState.manual.customColor} onChange={e => setManualField('customColor', e.target.value)} className="w-12 h-12 rounded cursor-pointer border-0 p-0" />
                )}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Fabric</label>
              <select value={designState.manual.fabric} onChange={e => setManualField('fabric', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gold appearance-none">
                <option>Silk</option>
                <option>Egyptian Cotton</option>
                <option>Linen</option>
                <option>Merino Wool</option>
                <option>Cashmere</option>
              </select>
            </div>
            
            {(designState.manual.type === 'Casual' || designState.manual.type === 'Business Suit') && (
              <>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Pattern</label>
                  <select value={designState.manual.pattern} onChange={e => setManualField('pattern', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gold appearance-none">
                    <option>Plain</option>
                    <option>Checks</option>
                    <option>Pinstripe</option>
                    <option>Plaid</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Sleeves</label>
                  <select value={designState.manual.sleeves} onChange={e => setManualField('sleeves', e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gold appearance-none">
                    <option>Full</option>
                    <option>Half</option>
                    <option>Quarter</option>
                  </select>
                </div>
              </>
            )}
            
          </div>
          
          <div className="border-t border-gray-100 pt-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">Measurements (inches)</label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <input type="number" placeholder="Chest" value={designState.manual.measurements.chest} onChange={e => setDesignState(prev => ({ ...prev, manual: { ...prev.manual, measurements: { ...prev.manual.measurements, chest: e.target.value } } }))} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gold text-center text-sm" />
              </div>
              <div>
                <input type="number" placeholder="Waist" value={designState.manual.measurements.waist} onChange={e => setDesignState(prev => ({ ...prev, manual: { ...prev.manual, measurements: { ...prev.manual.measurements, waist: e.target.value } } }))} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gold text-center text-sm" />
              </div>
              <div>
                <input type="number" placeholder="Shoulder" value={designState.manual.measurements.shoulder} onChange={e => setDesignState(prev => ({ ...prev, manual: { ...prev.manual, measurements: { ...prev.manual.measurements, shoulder: e.target.value } } }))} className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-gold text-center text-sm" />
              </div>
            </div>
          </div>
          
          <button onClick={handleManualGenerate} className="w-full bg-charcoal text-white py-4 rounded-xl mt-4 font-medium tracking-wide hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg">
            <Wand2 size={18} className="text-gold" /> Generate AI Blueprint
          </button>
        </div>
      </motion.section>
    );
  }

  if (designState.step === 2 && !designState.hasPreference) {
    return (
      <motion.section initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-3xl mx-auto px-6 py-16">
        <button onClick={() => setDesignState(p => ({...p, step: 1}))} className="text-gray-400 hover:text-charcoal mb-8 inline-flex items-center gap-2"><ChevronLeft size={16}/> Back</button>
        <h2 className="text-3xl font-bold tracking-tighter text-charcoal mb-2">Upload Profile Photo</h2>
        <p className="text-gray-400 mb-8 max-w-lg">Our AI will analyze your skin tone and body composition to architect the perfect color palette and cut.</p>
        
        <div className="bg-white border border-gray-100 border-dashed rounded-[2rem] p-12 text-center flex flex-col items-center justify-center min-h-[300px] hover:bg-gray-50 transition-colors cursor-pointer" onClick={handlePhotoUpload}>
          {designState.photoUrl ? (
            <>
               <CheckCircle size={48} className="text-green-500 mb-4" />
               <p className="text-charcoal font-medium">Photo securely processed.</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-charcoal rounded-full flex items-center justify-center mb-6 shadow-xl mx-auto">
                <Upload size={32} className="text-gold" />
              </div>
              <h3 className="text-lg font-bold text-charcoal mb-1">Tap to browse files</h3>
              <p className="text-sm text-gray-400">JPG, PNG up to 10MB</p>
            </>
          )}
        </div>
        
        <button onClick={handlePhotoGenerate} disabled={!designState.photoUrl} className="w-full bg-charcoal text-white py-4 rounded-xl mt-8 font-medium tracking-wide hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
          <Sparkles size={18} className="text-gold" /> Analyze & Generate Outfit
        </button>
      </motion.section>
    );
  }

  if (designState.step === 3) {
    return (
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto px-6 py-32 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ rotate: { repeat: Infinity, duration: 2, ease: "linear" }, scale: { repeat: Infinity, duration: 1, ease: "easeInOut" } }}>
          <Wand2 size={48} className="text-gold mb-8 opacity-80 mx-auto" />
        </motion.div>
        <h2 className="text-3xl font-bold tracking-tighter text-charcoal mb-4">
          {designState.hasPreference ? "Architecting your parameters..." : "Analyzing complexion & form..."}
        </h2>
        <p className="text-gray-400 font-mono text-sm max-w-sm mx-auto">
          Calibrating weave tension • Synthesizing color nodes • Projecting silhouette
        </p>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12"
    >
      <div className="flex-1 bg-gray-50 rounded-[2.5rem] p-12 flex flex-col items-center justify-center min-h-[600px] border border-gray-100 relative overflow-hidden shadow-inner">
        <div className="absolute top-12 w-full px-12 z-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-charcoal/90 leading-none">
            {designState.name}
          </h2>
          <p className="text-gray-500 font-medium mt-3 uppercase tracking-widest text-sm">
            {designState.fabric} • Base {designState.color}
          </p>
        </div>

        <div className="relative w-full h-[400px] flex justify-center items-center mt-20 z-10 px-6">
          <motion.div
            animate={designState.imageUrl ? {} : { rotateY: [0, 8, -8, 0], scale: [0.98, 1, 0.98] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className={`w-full h-full flex justify-center items-center ${designState.imageUrl ? 'rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-100' : 'perspective-[1000px]'}`}
            style={!designState.imageUrl ? { color: designState.color } : {}}
          >
            {designState.imageUrl ? (
              <img src={designState.imageUrl} alt={designState.name} className="w-full h-full object-contain" />
            ) : (
              designState.gender === 'man' ? <ManSilhouette /> : <WomanSilhouette />
            )}
          </motion.div>
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-10 w-full px-12 z-20">
          <div className="bg-white/90 backdrop-blur-md border border-white p-6 rounded-[2rem] shadow-xl">
            <h4 className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-gold" /> Dynamic Modifiers
            </h4>
            <ul className="flex flex-wrap gap-2">
              {designState.features.map((feat, idx) => (
                <li key={idx} className="bg-gray-50 text-charcoal text-xs px-4 py-2 rounded-full font-medium border border-gray-100 flex items-center gap-2">
                  <CheckCircle size={12} className="text-gold" /> {feat}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      <div className="flex-[0.5] flex flex-col gap-6 pt-4">
        <div className="bg-white border flex flex-col gap-4 border-gray-100 rounded-[2rem] p-8 shadow-sm">
           <h3 className="text-2xl font-bold tracking-tighter text-charcoal mb-2">Finalization</h3>
           <p className="text-sm text-gray-500 mb-4">Your personalized AI blueprint has been successfully drafted. Secure it to your collection or proceed to bespoke sizing.</p>

           <button onClick={handleSaveToProfile} disabled={isSaving} className="w-full bg-white border border-gray-200 text-charcoal px-6 py-4 rounded-2xl font-medium tracking-wide hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50">
             <Save size={18} /> {isSaving ? "Saving..." : "Save to Showcase"}
           </button>
           <button onClick={() => setDesignState(p => ({...p, step: 0}))} className="w-full text-center mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-charcoal transition-colors">Start Over</button>
        </div>
      </div>
    </motion.section>
  );
}

function PerfectFitModal({ onClose, designState, session }) {
  const [unit, setUnit] = useState('in');
  const [measurements, setMeasurements] = useState({ height: '', chest: '', waist: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleFinalize = async () => {
    if (!session?.user) {
      alert("Authentication required to finalize dimensions into the database.");
      return;
    }
    setIsSaving(true);
    const { error } = await supabase.from('designs').insert({
      user_id: session.user.id,
      design_name: designState.name !== 'AI Pending...' ? designState.name : 'Custom Commission',
      hex_code: designState.color,
      fabric_type: designState.fabric || 'Cotton',
      measurements: measurements
    });
    setIsSaving(false);

    if (!error) {
      alert("Dimensions captured successfully! This commission is now active in your collection.");
      onClose();
    } else {
      alert("Failed to commit dimensions to database. " + error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 50, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 50, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden"
      >
        <div className="p-8 md:p-12 relative">
          <button onClick={onClose} className="absolute top-8 left-8 text-gray-400 hover:text-charcoal transition-colors">
            <ChevronLeft size={24} />
          </button>

          <div className="text-center mb-10 mt-6">
            <h2 className="text-3xl font-bold tracking-tighter text-charcoal mb-2">The Perfect Fit</h2>
            <p className="text-gray-400 text-sm">Precision tailoring for <span className="font-semibold text-charcoal">{designState.name}</span></p>
          </div>

          <div className="flex justify-center mb-10">
            <div className="bg-gray-50 border border-gray-100 p-1 rounded-full inline-flex shadow-inner">
              <button
                onClick={() => setUnit('in')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${unit === 'in' ? 'bg-white shadow text-charcoal' : 'text-gray-400'}`}
              >
                Inches
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${unit === 'cm' ? 'bg-white shadow text-charcoal' : 'text-gray-400'}`}
              >
                CM
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {['Height', 'Chest', 'Waist'].map(field => (
              <div key={field} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 pb-4">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">{field}</label>
                <div className="relative w-full md:w-1/2">
                  <input
                    type="number"
                    value={measurements[field.toLowerCase()]}
                    onChange={(e) => setMeasurements({ ...measurements, [field.toLowerCase()]: e.target.value })}
                    className="w-full bg-gray-50 border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-gold outline-none text-right font-mono text-lg font-medium text-charcoal shadow-inner"
                    placeholder={`00.0`}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono pointer-events-none">
                    {unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleFinalize}
            disabled={isSaving}
            className="w-full bg-charcoal text-white py-5 rounded-2xl mt-10 font-bold tracking-widest uppercase text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl disabled:opacity-50"
          >
            {isSaving ? "Syncing..." : "Confirm Dimensions"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Collection({ session }) {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      loadDesigns();
    }
  }, [session]);

  const loadDesigns = async () => {
    const { data, error } = await supabase
      .from('designs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDesigns(data);
    }
    setLoading(false);
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto px-6 py-12"
    >
      <div className="mb-12 border-b border-gray-100 pb-6 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter text-charcoal mb-2">Showcase Library</h2>
          <p className="text-gray-400">Live feed from the Supabase Data Store.</p>
        </div>
        <span className="text-gold font-medium bg-gold/10 px-4 py-1 rounded-full text-sm">{designs.length} Saved Designs</span>
      </div>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-gray-400">Loading your wardrobe from server...</div>
      ) : designs.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-inner">
          <svg viewBox="0 0 100 100" className="w-16 h-16 text-gray-300 mx-auto mb-4">
            <path d="M20 20 L80 20 L70 80 L30 80 Z" fill="currentColor" />
          </svg>
          <p className="text-gray-500 font-medium">Your collection is empty. Go generate something stylish!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {designs.map(d => (
            <div key={d.id} className="bg-white border flex flex-col border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1">
              <div className="w-full aspect-[4/3] rounded-3xl mb-6 relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: d.hex_code }}>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent mix-blend-overlay"></div>
                <svg viewBox="0 0 100 100" className="absolute w-24 h-24 text-white/20 group-hover:scale-110 transition-transform duration-500">
                  <path d="M35 15 C35 5, 65 5, 65 15 L85 30 C90 35, 95 45, 95 60 L80 50 L80 120 L55 120 L55 140 L45 140 L45 120 L20 120 L20 50 L5 60 C5 45, 10 35, 15 30 Z" fill="currentColor" />
                </svg>
              </div>
              <h3 className="font-bold text-xl text-charcoal truncate">{d.design_name}</h3>
              <p className="text-sm text-gray-500 uppercase tracking-widest mt-2">{d.fabric_type} • Sourced from DB</p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                <span>{new Date(d.created_at).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Ruler size={12} /> Locked</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}

export default App;
