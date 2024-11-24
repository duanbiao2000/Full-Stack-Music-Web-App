'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

import useSubscribeModal from '@/hooks/useSubscribeModal';
import { useUser } from '@/hooks/useUser';
import { postData } from '@/libs/helper';
import { getStripe } from '@/libs/stripeClient';
import { Price, ProductWithPrice } from '@/types';

import Modal from './Modal';
import Button from './Button';

// 定义订阅模态框的props接口
interface SubscribeModalProps {
  products: ProductWithPrice[];
}

// 格式化价格
const formatPrice = (price: Price) => {
  const priceString = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency,
    minimumFractionDigits: 0,
  }).format((price?.unit_amount || 0) / 100);

  return priceString;
};

// 订阅模态框组件
const SubscribeModal: React.FC<SubscribeModalProps> = ({ products }) => {
  // 使用订阅模态框hook
  const subscribeModal = useSubscribeModal();
  // 使用用户hook
  const { user, isLoading, subscription } = useUser();

  // 定义价格id加载状态
  const [priceIdLoading, setPriceIdLoading] = useState<string>();

  // 处理模态框打开和关闭
  const onChange = (open: boolean) => {
    if (!open) {
      subscribeModal.onClose();
    }
  };

  // 处理支付
  const handleCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);
    // 如果用户未登录，提示错误
    if (!user) {
      setPriceIdLoading(undefined);
      return toast.error('Must be logged in');
    }

    // 如果用户已订阅，提示已订阅
    if (subscription) {
      setPriceIdLoading(undefined);
      return toast('Already subscribed');
    }

    try {
      const { sessionId } = await postData({
        url: '/api/create-checkout-session',
        data: { price },
      });

      const stripe = await getStripe();
      // 获取stripe实例
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      return toast.error((error as Error)?.message);
    } finally {
      setPriceIdLoading(undefined);
    }
  };

  let content = <div className="text-center">No products available.</div>;

  // 定义模态框内容
  if (products.length) {
    content = (
  // 如果有产品，显示产品列表
      <div>
        {products.map((product) => {
          if (!product.prices?.length) {
            return <div key={product.id}>No prices available</div>;
          // 如果产品没有价格，显示错误信息
          }

          return product.prices.map((price) => (
            <Button
          // 显示产品价格按钮
              key={price.id}
              onClick={() => handleCheckout(price)}
              disabled={isLoading || price.id === priceIdLoading}
              className="mb-4"
            >
              {`Subscribe for ${formatPrice(price)} a ${price.interval}`}
            </Button>
          ));
        })}
      </div>
    );
  }

  if (subscription) {
    content = (
  // 如果用户已订阅，显示已订阅信息
      <div className="text-center  bg-neutral-700 w-[50%] mx-auto">
        Already subscribed.
      </div>
    );
  }

  return (
    <Modal
  // 返回模态框
      title="Only for premium users"
      description="Upload Unlimited songs"
      isOpen={subscribeModal.isOpen}
      onChange={onChange}
    >
      {content}
    </Modal>
  );
};

export default SubscribeModal;
