import { Link, useParams } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

export default function OrderSuccess() {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  return (
    <div className="container-custom py-20 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}>
        <CheckCircleIcon className="w-20 h-20 text-success mx-auto mb-6" />
      </motion.div>
      <h1 className="font-heading text-3xl md:text-4xl mb-3">Order Placed Successfully!</h1>
      <p className="text-secondary-500 mb-2">Your order number is</p>
      <p className="text-xl font-medium text-secondary-900 mb-8">{orderNumber}</p>
      <div className="flex items-center justify-center gap-4">
        <Link to={`/orders`} className="btn-primary">View Orders</Link>
        <Link to="/search" className="btn-secondary">Continue Shopping</Link>
      </div>
    </div>
  );
}
