import React from 'react';

interface SOSProductCardProps {
  imageUrl?: string;
  title: string;
  deliveryTime: string;
  price: number;
}

const SOSProductCard: React.FC<SOSProductCardProps> = ({ imageUrl, title, deliveryTime, price }) => (
  <div className="bg-white border border-[#e0e0e0] rounded-2xl p-6 md:w-96 shadow-sm hover:shadow-lg transition-shadow transform hover:scale-[1.03] duration-200">
    <div className="flex items-center">
      <div className="h-24 w-24 bg-sand-300 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-sand-200 shadow-sm mr-4">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="h-24 w-24 object-cover rounded-xl" />
        ) : null}
      </div>
      <div className="flex-grow text-left">
        <h3 className="font-bold text-dark text-lg mb-1 leading-tight">{title}</h3>
        <p className="text-dark-500 text-sm mb-2">{deliveryTime}</p>
        <p className="text-primary font-extrabold text-xl">{price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
      </div>
    </div>
  </div>
);

export default SOSProductCard; 