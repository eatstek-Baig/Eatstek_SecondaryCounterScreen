import React from "react";
import { useSGlobalContext } from "../../lib/contexts/useGlobalContext";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { LIVE_URL } from "../../lib/services/api/httpClient";

export default function CategoryCard({ imageSrc, title, productId }) {
  const { toggleCategoryIdFunction } =
    useSGlobalContext();

  const handleClick = () => {
    toggleCategoryIdFunction(productId);
  };

  return (
    <div className="w-full flex items-stretch group rounded-lg cursor-pointer">
      <div
        onClick={handleClick}
        className="pb-[55px] relative w-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 group-hover:border-[#d97706] hover:border-[#d97706] transition-all duration-300"
      >
        <div className="p-4">
          <LazyLoadImage
            className="rounded-t-lg h-[145px] mx-auto"
            alt={`${title}-image`}
            effect="blur"
            wrapperProps={{
              style: { transitionDelay: ".2s" },
            }}
            src={
              imageSrc
                ? `${imageSrc}`
                : "/dummy-image.webp"
            }
          />
        </div>
        <h5 className="text-[#d97706] bg-gray-100 py-3 text-[17px] leading-1 font-bold text-center absolute left-0 right-0 bottom-0 rounded-b-lg group-hover:bg-[#d97706] group-hover:text-white transition-all duration-300 px-2">
          {title.toUpperCase()}
        </h5>
      </div>
    </div>
  );
}
