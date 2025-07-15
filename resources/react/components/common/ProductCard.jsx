import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { LIVE_URL } from "../../lib/services/api/httpClient";

export default function ProductCard({ imageSrc, title, handleClick }) {
  return (
    <div
      className="relative bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 hover:border-[#d97706] cursor-pointer"
      onClick={handleClick}
      style={{
        height: '280px', // Fixed height for consistent alignment
        display: 'flex',
        flexDirection: 'column',
        borderWidth: '3px',
        borderRadius: '16px',
        transition: 'all 0.2s ease-in-out',
        overflow: 'hidden'
      }}
    >
      {/* Fixed Image Container */}
      <div style={{
        height: '200px', // Fixed height for image area
        width: '100%',
        overflow: 'hidden',
        borderRadius: '12px 12px 0 0',
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <LazyLoadImage
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            padding: '8px'
          }}
          alt={`${title}-image`}
          effect="blur"
          wrapperProps={{
            style: { 
              transitionDelay: ".2s",
              width: '100%',
              height: '100%'
            },
          }}
          src={imageSrc ? imageSrc : "/dummy-image.webp"}
        />
      </div>
      
      {/* Fixed Text Container */}
      <div style={{
        height: '80px', // Fixed height for text area
        padding: '12px',
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        borderRadius: '0 0 12px 12px'
      }}>
        <h4 style={{
          fontSize: '22px',
          fontWeight: '700',
          lineHeight: '1.2',
          color: '#111827',
          margin: 0,
          padding: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          letterSpacing: '0.3px'
        }}>
          {title}
        </h4>
      </div>
    </div>
  );
}