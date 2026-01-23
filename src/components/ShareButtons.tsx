import { motion } from 'framer-motion';
import { Instagram, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonsProps {
  title?: string;
  url?: string;
}

export function ShareButtons({ 
  title = 'Edu Book Kids - Ebooks e Atividades para Crianças',
  url = typeof window !== 'undefined' ? window.location.href : ''
}: ShareButtonsProps) {
  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${title} - ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareToInstagram = () => {
    navigator.clipboard.writeText(`${title} - ${url}`);
    toast.success('Link copiado! Cole no Instagram 📸');
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copiado! 📋');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={shareNative}
        className="p-4 bg-primary text-primary-foreground rounded-full shadow-hover"
        title="Compartilhar"
      >
        <Share2 className="h-5 w-5" />
      </motion.button>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={shareToInstagram}
        className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full shadow-hover"
        title="Instagram"
      >
        <Instagram className="h-5 w-5" />
      </motion.button>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={shareToWhatsApp}
        className="p-4 bg-green-500 text-white rounded-full shadow-hover"
        title="WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
      </motion.button>
    </div>
  );
}
