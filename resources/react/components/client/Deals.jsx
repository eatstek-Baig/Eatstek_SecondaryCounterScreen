import React, { useEffect, useState , useContext } from "react";
import { useSGlobalContext } from "../../lib/contexts/useGlobalContext";
import ProductCard from "../common/ProductCard";
import DealDetails from "./DealDetails.";
import CardSkeleton from "../common/CardSkeleton";
import ProductDetailsPopup from "../common/CustomPopoup";
import { ToastContainer } from "react-toastify";
import { WebSocketContext } from '../../lib/providers/WebSocketProvider';

export default function Deals() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openPopup, setOpenPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState(null);
  const { allData } = useSGlobalContext();

  const { isLoading } = useContext(WebSocketContext);

  useEffect(() => {
    if (allData && allData.catalogs && allData.catalogs[0]?.data?.categories) {
      setDeals(allData);
      setLoading(false);
    }
  }, [allData]);

  const handleTitleClick = (product) => {
    setOpenPopup(true);
    setSelectedProduct(product);
  };

  return (
    <div>
      {/* Add ToastContainer here */}
      <ToastContainer />
      {selectedProduct && (
        <ProductDetailsPopup
          open={openPopup}
          onClose={() => setOpenPopup(false)}
          title="Deal Details"
          items={
            <DealDetails
              closeModal={() => setOpenPopup(false)}
              selected_deal={selectedProduct}
              allData={deals}
            />
          }
        />
      )}

      {isLoading ? (
        <div className="relative flex items-center justify-center w-full h-[calc(100vh-55px)]">
          <div className="screen_loader bg-white z-[60] flex flex-col items-center justify-center animate__animated">
            <svg width="64" height="64" viewBox="0 0 135 135" xmlns="http://www.w3.org/2000/svg" fill="#4361ee">
              <path d="M67.447 58c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10zm9.448 9.447c0 5.523 4.477 10 10 10 5.522 0 10-4.477 10-10s-4.478-10-10-10c-5.523 0-10 4.477-10 10zm-9.448 9.448c-5.523 0-10 4.477-10 10 0 5.522 4.477 10 10 10s10-4.478 10-10c0-5.523-4.477-10-10-10zM58 67.447c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10z">
                <animateTransform attributeName="transform" type="rotate" from="0 67 67" to="-360 67 67" dur="2.5s" repeatCount="indefinite" />
              </path>
              <path d="M28.19 40.31c6.627 0 12-5.374 12-12 0-6.628-5.373-12-12-12-6.628 0-12 5.372-12 12 0 6.626 5.372 12 12 12zm30.72-19.825c4.686 4.687 12.284 4.687 16.97 0 4.686-4.686 4.686-12.284 0-16.97-4.686-4.687-12.284-4.687-16.97 0-4.687 4.686-4.687 12.284 0 16.97zm35.74 7.705c0 6.627 5.37 12 12 12 6.626 0 12-5.373 12-12 0-6.628-5.374-12-12-12-6.63 0-12 5.372-12 12zm19.822 30.72c-4.686 4.686-4.686 12.284 0 16.97 4.687 4.686 12.285 4.686 16.97 0 4.687-4.686 4.687-12.284 0-16.97-4.685-4.687-12.283-4.687-16.97 0zm-7.704 35.74c-6.627 0-12 5.37-12 12 0 6.626 5.373 12 12 12s12-5.374 12-12c0-6.63-5.373-12-12-12zm-30.72 19.822c-4.686-4.686-12.284-4.686-16.97 0-4.686 4.687-4.686 12.285 0 16.97 4.686 4.687 12.284 4.687 16.97 0 4.687-4.685 4.687-12.283 0-16.97zm-35.74-7.704c0-6.627-5.372-12-12-12-6.626 0-12 5.373-12 12s5.374 12 12 12c6.628 0 12-5.373 12-12zm-19.823-30.72c4.687-4.686 4.687-12.284 0-16.97-4.686-4.686-12.284-4.686-16.97 0-4.687 4.686-4.687 12.284 0 16.97 4.686 4.687 12.284 4.687 16.97 0z">
                <animateTransform attributeName="transform" type="rotate" from="0 67 67" to="360 67 67" dur="8s" repeatCount="indefinite" />
              </path>
            </svg>
            <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-white">
              Processing Card Machine request...
            </p>
          </div>
        </div>
      ) : (

        <div className="z-[2] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-[15px] md:gap-[15px] items-stretch w-full">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <CardSkeleton height="h-[210px]" key={i} />
            ))
          ) : deals?.catalogs?.[0]?.data?.deals?.length > 0 ? (
            deals?.catalogs?.[0]?.data?.deals?.map((item) => (
              <ProductCard
                key={item?.id}
                imageSrc={
                  item?.image_data[0] || "/dummy-image.webp"
                }
                title={item?.name}
                handleClick={() => handleTitleClick({ "item": item, "lines": item?.lines })}
              />
            ))
          ) : (
            <p>No category products found</p>
          )}
        </div>
      )}
    </div>
  );
}
