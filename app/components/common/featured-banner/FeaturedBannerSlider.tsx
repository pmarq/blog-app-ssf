// app/components/common/featured-banner/FeaturedBannerSlider.tsx

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import Slider, { Settings } from "react-slick";

// Import do CSS do slick-carousel
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Importe o seu botão customizado
// Ajuste o caminho se ele estiver em outro lugar
import { Button } from "../../ui/button";

// Interface do banner, refletindo o formato real:
// banner: { url: string; public_id: string; }
export interface FeaturedBanner {
  id: string;
  title: string;
  link: string;
  linkTitle: string;
  banner: {
    url: string;
    public_id: string;
  };
}

interface Props {
  banners: FeaturedBanner[];
}

const settings: Settings = {
  dots: true,
  lazyLoad: "anticipated",
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: true,
  autoplay: true,
  autoplaySpeed: 3000, // Opcional: tempo entre as transições
};

export default function FeaturedProductsSlider({ banners }: Props) {
  const router = useRouter();

  // Se não houver banners, não renderiza nada
  if (!banners.length) return null;

  return (
    <div className="h-[350px]">
      <Slider {...settings}>
        {banners.map(({ banner, title, link, linkTitle }, index) => (
          <div className="select-none relative" key={index}>
            {/* Container da imagem */}
            <div className="w-full h-[320px] relative">
              <Image
                fill
                src={banner.url} // <-- Use banner.url, que é de fato uma string
                alt={title}
                style={{ objectFit: "cover" }}
              />
            </div>

            {/* Conteúdo sobreposto */}
            <div className="absolute inset-0 p-5">
              <div className="w-1/2 h-full flex flex-col items-start justify-center">
                <h1 className="text-3xl font-semibold mb-2">{title}</h1>
                <Button onClick={() => router.push(link)}>{linkTitle}</Button>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
