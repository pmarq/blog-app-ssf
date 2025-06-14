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

  // Se houver apenas 1 banner, renderize sem Slider
  if (banners.length === 1) {
    const { banner, title, link, linkTitle } = banners[0];
    return (
      <div
        className="
          w-screen
          h-[180px]         /* altura padrão no mobile */
          sm:h-[220px]      /* a partir de 640px */
          md:h-[260px]      /* a partir de 768px */
          lg:h-[300px]      /* a partir de 1024px */
          xl:h-[350px]      /* a partir de 1280px */
          relative
          left-1/2
          right-1/2
          -ml-[50vw]
          -mr-[50vw]
          max-w-none
          p-0
          m-0
          -mt-4
        "
        style={{
          top: 0,
        }}
      >
        {/* Container da imagem */}
        <div
          className="
            w-full
            h-[180px]
            sm:h-[220px]
            md:h-[260px]
            lg:h-[300px]
            xl:h-[350px]
            relative
          "
        >
          <Image
            fill
            src={banner.url} // <-- Use banner.url, que é de fato uma string
            alt={title}
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* Conteúdo sobreposto */}
        <div className="absolute inset-0 px-10">
          <div className="w-1/2 h-full flex flex-col items-start justify-center">
            <h1 className="text-sm sm:text-xl md:text-2xl text-white font-semibold mb-2 leading-none sm:leading-tight md:leading-normal">
              {title}
            </h1>
            <Button
              className="h-3 px-2 py-1 text-[8px] sm:h-6 sm:px-4 sm:text-xs md:h-6 md:text-xs"
              onClick={() => router.push(link)}
            >
              {linkTitle}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Se houver dois ou mais banners, use o Slider normalmente
  return (
    <div
      className="
        w-screen
        h-[180px]         /* altura padrão no mobile */
        sm:h-[220px]      /* a partir de 640px */
        md:h-[260px]      /* a partir de 768px */
        lg:h-[300px]      /* a partir de 1024px */
        xl:h-[350px]      /* a partir de 1280px */
        relative
        left-1/2
        right-1/2
        -ml-[50vw]
        -mr-[50vw]
        max-w-none
        p-0
        m-0
        -mt-4
      "
      style={{
        top: 0,
      }}
    >
      <Slider {...settings}>
        {banners.map(({ banner, title, link, linkTitle }, index) => (
          <div className="select-none relative" key={index}>
            {/* Container da imagem */}
            <div
              className="
                w-full
                h-[180px]
                sm:h-[220px]
                md:h-[260px]
                lg:h-[300px]
                xl:h-[350px]
                relative
              "
            >
              <Image
                fill
                src={banner.url} // <-- Use banner.url, que é de fato uma string
                alt={title}
                style={{ objectFit: "cover" }}
              />
            </div>

            {/* Conteúdo sobreposto */}
            <div className="absolute inset-0 px-10">
              <div className="w-1/3 h-full p-0 md:p-12  flex flex-col items-start justify-center">
                <h1 className="text-sm sm:text-xl md:text-3xl text-white font-semibold mb-4 leading-tight sm:leading-tight md:leading-normal">
                  {title}
                </h1>
                <Button
                  className="h-3 px-2 py-1 text-[8px] sm:h-6 sm:px-4 sm:text-xs md:h-6 md:text-xs"
                  onClick={() => router.push(link)}
                >
                  {linkTitle}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
