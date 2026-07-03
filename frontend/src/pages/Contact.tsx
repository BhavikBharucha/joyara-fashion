import toast from 'react-hot-toast';

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We will get back to you soon.');
  };

  return (
    <div className="container-custom py-16 md:py-24 max-w-2xl mx-auto">
      <h1 className="section-title text-center mb-8">Contact Us</h1>
      <p className="text-center text-secondary-500 text-sm mb-12">We'd love to hear from you. Send us a message!</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Name" className="input-field" required />
          <input type="email" placeholder="Email" className="input-field" required />
        </div>
        <input type="text" placeholder="Subject" className="input-field" required />
        <textarea placeholder="Your message" rows={5} className="input-field resize-none" required />
        <button type="submit" className="btn-primary w-full">Send Message</button>
      </form>
    </div>
  );
}
