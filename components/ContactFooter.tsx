import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Send, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const ContactFooter: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'name' | 'phone' | 'email' | 'message', string>>>({});
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [nowTs, setNowTs] = useState(() => Date.now());

  const cooldownRemainingSeconds = useMemo(() => {
    if (!cooldownUntil) return 0;
    return Math.max(0, Math.ceil((cooldownUntil - nowTs) / 1000));
  }, [cooldownUntil, nowTs]);

  const isCoolingDown = cooldownRemainingSeconds > 0;

  useEffect(() => {
    if (!cooldownUntil) return;
    if (cooldownUntil <= Date.now()) return;

    const id = window.setInterval(() => setNowTs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [cooldownUntil]);

  const validate = (values: { name: string; phone: string; email: string; message: string }) => {
    const errors: Partial<Record<'name' | 'phone' | 'email' | 'message', string>> = {};

    const trimmedName = values.name.trim();
    const trimmedPhone = values.phone.trim();
    const trimmedEmail = values.email.trim();
    const trimmedMessage = values.message.trim();

    const emailOk = !trimmedEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    const phoneOk = !trimmedPhone || trimmedPhone.replace(/\D/g, '').length >= 6;

    if (!trimmedName) errors.name = 'Укажите имя';
    if (!trimmedMessage) errors.message = 'Введите сообщение';
    if (!trimmedPhone && !trimmedEmail) {
      errors.phone = 'Укажите телефон или email';
      errors.email = 'Укажите телефон или email';
    }
    if (trimmedEmail && !emailOk) errors.email = 'Некорректный email';
    if (trimmedPhone && !phoneOk) errors.phone = 'Некорректный телефон';

    return {
      ok: Object.keys(errors).length === 0,
      errors,
      normalized: {
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        message: trimmedMessage,
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitState === 'sending') return;
    if (isCoolingDown) return;

    const result = validate({ name, phone, email, message });
    setFieldErrors(result.errors);
    if (!result.ok) return;

    setSubmitState('sending');
    setSubmitError(null);

    try {
      const base = import.meta.env.VITE_CONTACT_API_URL as string | undefined;
      if (!base && !import.meta.env.DEV) {
        throw new Error('CONTACT_API_NOT_CONFIGURED');
      }
      const endpoint = base ? `${base.replace(/\/$/, '')}/api/contact` : '/api/contact';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: result.normalized.name,
          phone: result.normalized.phone,
          email: result.normalized.email,
          message: result.normalized.message,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Request failed: ${res.status}`);
      }

      setSubmitState('sent');
      setFieldErrors({});
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
      setCooldownUntil(Date.now() + 20_000);
    } catch (err) {
      setSubmitState('error');
      setSubmitError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <section className="relative w-full h-full flex items-start md:items-center overflow-hidden pointer-events-none py-6 md:py-0">
      <div className="container mx-auto px-4 md:px-6 relative z-10 pointer-events-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-16 items-start md:items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: false }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-6xl font-display text-white mb-3 md:mb-6 leading-tight md:leading-none">
              Готовы к <br/>
              <span className="inline-block pt-[1px] pb-[3px] leading-[1.2] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Взлету?</span>
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm md:text-xl mb-4 md:mb-8 max-w-md border-l-4 border-cyan-500/50 pl-3 md:pl-6 bg-black/40 backdrop-blur-md p-3 md:p-6 rounded-r-lg">
              Оставьте заявку. и мы разработаем персональную стратегию развития вашей территории,
            </p>
            
            <div className="flex space-x-4 md:space-x-8 mb-4 lg:mb-0">
               <a href="#" className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors group">
                   <MessageSquare className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                   <span className="text-[10px] sm:text-xs md:text-sm font-mono group-hover:underline">DIRECT_LINK</span>
               </a>
            </div>
          </motion.div>

          {/* Terminal Form */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: false }}
            className="tech-border bg-[#0A0A0F]/90 backdrop-blur-xl p-4 sm:p-6 md:p-12 relative shadow-[0_0_50px_rgba(0,247,255,0.1)] border-white/10 -translate-y-4 sm:-translate-y-2 md:-translate-y-0"
          >
            {/* Header decor */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
            
            <h3 className="text-base md:text-xl font-display text-white mb-4 md:mb-8 tracking-widest flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                COMMS_CHANNEL
            </h3>

            <form className="space-y-2 md:space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                <div className="group">
                    <label className="text-[9px] md:text-xs text-cyan-400 font-mono uppercase mb-1 block tracking-wider">Identity</label>
                    <input 
                    type="text" 
                    placeholder="Имя" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#050508]/70 border border-white/20 rounded-none px-2 py-2 md:px-4 md:py-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:bg-[#0A0A0F] transition-colors font-mono text-xs sm:text-sm min-h-[40px]"
                    />
                    {fieldErrors.name && (
                      <div className="text-[10px] md:text-xs text-red-400 font-mono uppercase tracking-widest break-words mt-1">
                        {fieldErrors.name}
                      </div>
                    )}
                </div>
                <div className="group">
                    <label className="text-[9px] md:text-xs text-cyan-400 font-mono uppercase mb-1 block tracking-wider">Frequency</label>
                    <input 
                    type="tel" 
                    placeholder="Телефон" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#050508]/70 border border-white/20 rounded-none px-2 py-2 md:px-4 md:py-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:bg-[#0A0A0F] transition-colors font-mono text-xs sm:text-sm min-h-[40px]"
                    />
                    {fieldErrors.phone && (
                      <div className="text-[10px] md:text-xs text-red-400 font-mono uppercase tracking-widest break-words mt-1">
                        {fieldErrors.phone}
                      </div>
                    )}
                </div>
              </div>
              
              <div className="group">
                 <label className="text-[9px] md:text-xs text-cyan-400 font-mono uppercase mb-1 block tracking-wider">Coordinates</label>
                 <input 
                    type="email" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#050508]/70 border border-white/20 rounded-none px-2 py-2 md:px-4 md:py-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:bg-[#0A0A0F] transition-colors font-mono text-xs sm:text-sm min-h-[40px]"
                 />
                 {fieldErrors.email && (
                   <div className="text-[10px] md:text-xs text-red-400 font-mono uppercase tracking-widest break-words mt-1">
                     {fieldErrors.email}
                   </div>
                 )}
              </div>

              <div className="group">
                 <label className="text-[9px] md:text-xs text-cyan-400 font-mono uppercase mb-1 block tracking-wider">Transmission</label>
                 <textarea 
                    rows={3} 
                    placeholder="Сообщение..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#050508]/70 border border-white/20 rounded-none px-2 py-2 md:px-4 md:py-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:bg-[#0A0A0F] transition-colors font-mono text-xs sm:text-sm resize-none"
                 ></textarea>
                 {fieldErrors.message && (
                   <div className="text-[10px] md:text-xs text-red-400 font-mono uppercase tracking-widest break-words mt-1">
                     {fieldErrors.message}
                   </div>
                 )}
              </div>

              <button
                className="w-full bg-cyan-900/30 border border-cyan-500/50 text-cyan-400 font-mono font-bold py-2 md:py-4 uppercase tracking-[0.15em] hover:bg-cyan-500 hover:text-black transition-all group flex items-center justify-center space-x-2 text-[9px] sm:text-xs md:text-sm shadow-[0_0_15px_rgba(0,247,255,0.1)] min-h-[44px]"
                disabled={submitState === 'sending' || isCoolingDown}
                type="submit"
              >
                {submitState === 'sending' ? (
                  <>
                    <span>Отправка...</span>
                    <Loader2 size={16} className="animate-spin" />
                  </>
                ) : (
                  <>
                    <span>{isCoolingDown ? `Повтор через ${cooldownRemainingSeconds}с` : 'Отправить данные'}</span>
                    <Send size={16} className="transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {submitState === 'sent' && (
                <div className="text-[10px] md:text-xs text-green-400 font-mono uppercase tracking-widest">
                  Данные отправлены
                </div>
              )}
              {submitState === 'error' && (
                <div className="text-[10px] md:text-xs text-red-400 font-mono uppercase tracking-widest break-words">
                  Ошибка отправки{submitError ? `: ${submitError}` : ''}
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
      
      <div className="absolute bottom-0 sm:bottom-2 left-0 w-full text-center z-20 pointer-events-auto">
          <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
              &copy; 2026 Digital Creative Space. System Secure.
          </p>
      </div>
    </section>
  );
};

export default ContactFooter;