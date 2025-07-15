import React, { useEffect, useState, useMemo } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Category from "./Category";
import CounterBox from "../common/CounterBox";
import { useCart } from "react-use-cart";
import MealsPopoup from "../common/MealsPopup";
import { LIVE_URL } from "../../lib/services/api/httpClient";
import { useSGlobalContext } from "../../lib/contexts/useGlobalContext";
import { showToast } from "../../lib/utils/helpers";
import { ToastContainer } from "react-toastify";

export default function ProductDetails(props) {
  const { addItem } = useCart();
  const { allData } = useSGlobalContext();
  const [data, setData] = useState(null);
  const [product_detail, setProduct_detail] = useState(null);
  const [cat_id, setCat_id] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [choices, setChoices] = useState([]);
  const [choice_options, setChoice_options] = useState([]);
  const [selectedChoiceOption, setSelectedChoiceOption] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [openPopup, setOpenPopup] = useState(false);
  const [popupItems, setPopupItems] = useState([]);
  const [popupTitle, setPopupTitle] = useState("");
  const [selectedSideItems, setSelectedSideItems] = useState("");
  const [selectedDrinkItems, setSelectedDrinkItems] = useState("");

  // console.log("ProductDetails", product_detail)
  // console.log("Choices", choices)
  // console.log("SelectedChoice", selectedChoice)
  // console.log("Choice_Options", choice_options)
  // console.log("SelectedChoiceOption", selectedChoiceOption)

  useEffect(() => {
    setProduct_detail(props?.product_detail)
  }, []);

  useEffect(() => {
    if (allData && allData.catalogs && allData.catalogs[0]?.data?.categories) {
      setData(allData);
      // setLoading(false);
    }
  }, [allData]);

  useEffect(() => {
    if (!product_detail) return;

    if (!selectedSize && product_detail?.skus?.length > 0) {
      setSelectedSize(product_detail.skus[0]);
    }
    const optionsListIds = selectedSize?.option_list_ids;

    if (Array.isArray(optionsListIds) && optionsListIds?.length > 0) {
      const filteredData = data?.catalogs[0]?.data?.option_lists.filter(item => {
        return item.hubrise_id && optionsListIds.includes(item.hubrise_id);
      });
      setChoices(filteredData || []);
    } else {
      setChoices([]);
      setChoice_options([]);
    }

  }, [product_detail, selectedSize, selectedChoice]);

  const handleSizeClick = (size) => {
    setSelectedSize(size);
    // if (size?.option_list_ids?.length !== 0) {
    setSelectedChoice("");
    setChoices([]);
    setChoice_options([]);
    setSelectedChoiceOption([]);
    // }
  };

  const handleChoiceClick = (choice) => {
    setSelectedChoice(choice);
    setChoice_options(choice?.options?.map((option) => ({
      ...option,
      min_selections: choice?.min_selections,
      max_selections: choice?.max_selections
    }))
      || []);
  };

  // const handleChoiceOptionClick = (option) => {
  //   setSelectedChoiceOption((prev) => {
  //     const choiceName = selectedChoice?.name;
  //     const isSingleChoice = option.min_selections === 0 && option.max_selections === 1; // Only for this condition

  //     const isAlreadySelected = prev.some((item) => item.id === option.id);

  //     // Handle the case where only one option can be selected (min_selections = 0, max_selections = 1)
  //     if (isSingleChoice) {
  //       if (isAlreadySelected) {
  //         // If the option is already selected, deselect it (unselect this option)
  //         return prev.filter(item => item.id !== option.id);
  //       }

  //       // If no option is selected, or another option is selected, deselect the previous one and select this one
  //       return [
  //         {
  //           ...option,
  //           choice_name: choiceName,
  //         },
  //       ];
  //     }

  //     // Logic for other conditions (keep your previous behavior for these)
  //     if (isAlreadySelected) {
  //       return prev.filter((item) => item.id !== option.id);
  //     }

  //     return [
  //       ...prev,
  //       {
  //         ...option,
  //         choice_name: choiceName,
  //       },
  //     ];
  //   });
  // };

  const handleChoiceOptionClick = (option) => {
    setSelectedChoiceOption((prev) => {
      const choiceName = selectedChoice?.name;
      const isRequiredChoice = option.min_selections === 1 && option.max_selections === 1;
      const isSingleChoice = option.min_selections === 0 && option.max_selections === 1;
  
      const isAlreadySelected = prev.some((item) => item.id === option.id);
  
      // 1. Handle REQUIRED choices (min=1, max=1)
      if (isRequiredChoice) {
        // If already selected, deselect it
        if (isAlreadySelected) {
          return prev.filter((item) => item.id !== option.id);
        }
        // If another option was selected for this choice, replace it
        const filteredPrev = prev.filter((item) => item.choice_name !== choiceName);
        return [...filteredPrev, { ...option, choice_name: choiceName }];
      }
  
      // 2. Handle SINGLE choices (min=0, max=1)
      if (isSingleChoice) {
        if (isAlreadySelected) {
          return prev.filter((item) => item.id !== option.id);
        }
        // Deselect any other option for this choice
        const filteredPrev = prev.filter((item) => item.choice_name !== choiceName);
        return [...filteredPrev, { ...option, choice_name: choiceName }];
      }
  
      // 3. Handle MULTIPLE choices (min=0, max=N)
      if (isAlreadySelected) {
        return prev.filter((item) => item.id !== option.id);
      }
      return [...prev, { ...option, choice_name: choiceName }];
    });
  };
  
  const computedTotalPrice = useMemo(() => {
    const sizePrice = selectedSize && selectedSize.price
      ? parseFloat(selectedSize.price.match(/\d+(\.\d+)?/)?.[0] || 0) : 0;

    // const choiceOptionPrice = selectedChoiceOption && selectedChoiceOption.price
    //   ? parseFloat(selectedChoiceOption.price.match(/\d+(\.\d+)?/)?.[0] || 0) : 0;

    const choiceOptionPrice = selectedChoiceOption?.reduce((total, option) => {
      return total + (parseFloat(option.price.match(/\d+(\.\d+)?/)?.[0] || 0));
    }, 0) || 0;

    return (sizePrice + choiceOptionPrice) * quantity;
  }, [selectedSize, selectedChoiceOption, quantity]);

  useEffect(() => {
    setTotalPrice(computedTotalPrice.toFixed(2));
  }, [computedTotalPrice]);

  const addToCart = () => {

    // Get Required Choices
    const requiredChoices = choices.filter(choice =>
      choice.min_selections === 1 && choice.max_selections === 1
    );

    // Check if at least One Option is selected From each Required Choice
    const isMissingRequiredOption = requiredChoices.some(choice =>
      !selectedChoiceOption.some(option => option.choice_name === choice.name)
    );

    if (isMissingRequiredOption) {
      showToast("Please select at least one option from the Required Choices!", "error");
      return;
    }

    const item =
    {
      id: `${product_detail?.id}_${selectedSize?.id || ""}_${selectedChoiceOption?.map(option => option.id).join("_")}`,
      product_id: product_detail?.id,
      product_name: product_detail?.name,
      quantity: quantity,
      productId: product_detail?.id,
      name: product_detail?.name,
      price: (parseFloat(totalPrice) / quantity).toFixed(2),
      size: selectedSize?.name,
      choice: selectedChoice?.name,
      choiceOption: selectedChoiceOption?.map(option => option.name).join(", "),
      choices: selectedChoice
        ? [
          {
            id: selectedChoice.id,
            choice_name: selectedChoice.name,
            pivot: {
              choice_id: selectedChoice.id,
              product_id: product_detail?.id,
            },
            choice_options: selectedChoiceOption?.map(option => ({
              id: option.id,
              choice_id: selectedChoice.id,
              option_name: option.name,
              price: (parseFloat((option.price || "").split(" ")[0])).toFixed(2),
              status: 1,
              choice_name: option?.choice_name,
            })),
          },
        ]
        : [],
      sizes: selectedSize
        ? [
          {
            id: selectedSize.id,
            size_name: selectedSize.name,
            pivot: {
              product_id: selectedSize.product_id,
              size_id: selectedSize.name,
              product_price: (parseFloat((selectedSize.price || "").split(" ")[0])).toFixed(2)
            },
            status: 1,
          },
        ]
        : [],
      selectedSize: {
        id: selectedSize.id,
        size: selectedSize.name,
        price: selectedSize.price,
      },
    };

    // Add item to Cart and show the Cart
    addItem(item, quantity);
    props.closeModal(false);
  };

  const getMealIdFun = (id) => {
    const itembox = popupItems.find((item) => item.id === id);
    if (!itembox) return;
    const {
      id: pid,
      product_name: name,
      product_image: image,
      product_price: price,
    } = itembox;
    const commonData = {
      pid,
      name,
      image,
      price,
      status: popupTitle === "Drinks" ? "drinks" : "side",
    };
    if (popupTitle === "Drinks") {
      setSelectedDrinkItems(commonData);
    } else {
      setSelectedSideItems(commonData);
    }
    setOpenPopup(false);
  };

  const removeMealItem = (status) => {
    if (status == "drinks") {
      setSelectedDrinkItems(null);
    } else {
      setSelectedSideItems(null);
    }
  };

  return (
    <>
      <ToastContainer />
      {cat_id ? (
        <Category category_id={cat_id} />
      ) : (
        <>
          <div className="z-[2] grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-[20px] md:gap-6 items-stretch w-full">
                     
            <div className="p-4 flex items-center justify-center">
              <LazyLoadImage
                className="rounded-t-lg"
                alt={`${product_detail?.product_slug}-image`}
                src={
                  product_detail?.image_data?.length > 0
                    ? `${product_detail?.image_data[0]}`
                    : "/dummy-image.webp"
                }
              />
            </div>
            <div className="p-4">
              <div className="p-5 pt-0">
                 <h4 className="mb-2 text-2xl font-bold tracking-tight text-[#d97706] dark:text-white uppercase">
                  {product_detail?.name}
                </h4>

                <div className="text-xl font-bold">
                  {" "}
                  <span className="text-black">
                    £ {selectedSize?.price}
                  </span>
                </div>

                <p className="mt-2 text-base text-gray-700 dark:text-gray-300">
                  {product_detail?.description}
                </p>

                {/* Tags */}
                {product_detail?.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product_detail.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-[#d97706] text-white text-xs font-semibold px-3 py-1 rounded-full uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>)} 

                {product_detail?.skus?.some(size => size?.name) && (
                  <div className="mt-5">
                    <h5 className="text-lg mb-1">Sizes:</h5>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Render sizes only if they have valid names */}
                      {product_detail?.skus.map((size) => (
                        size?.name && (  // Only render valid sizes
                          <button
                            key={size?.id}
                            onClick={() => handleSizeClick(size)}
                            className={`min-w-[80px] items-center px-3 py-1 text-md font-medium text-center border border-[#d97706] rounded-lg capitalize ${selectedSize === size
                              ? "bg-[#D97706] text-white"
                              : "bg-white text-[#d97706]"
                              } hover:text-white hover:bg-[#D97706]`}
                          >
                            {size?.name}
                          </button>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {choices?.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-lg mb-1">Choices: </h5>
                    <div className="flex items-center gap-2">
                      {choices?.map((choice) => (
                        <button
                          key={choice?.id}
                          onClick={() => handleChoiceClick(choice)}
                          className={`min-w-[80px] items-center px-3 py-1 text-md font-medium text-center border border-[#d97706] rounded-lg ${selectedChoice?.id === choice?.id
                            ? "bg-[#D97706] text-white"
                            : "bg-white text-[#d97706]"
                            } hover:text-white hover:bg-[#D97706]`}
                        >
                          {choice?.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* 
                {choice_options?.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-lg mb-1">Choice Options: </h5>
                    {choice_options.some(item => item.min_selections === 1 && item.max_selections === 1) &&
                      !selectedChoiceOption.some(option => option.choice_name === selectedChoice?.name) && (
                        <p className="text-red-600 text-sm font-semibold mb-2">
                          Required, You must select one of these Options
                        </p>
                      )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {choice_options?.map((item) => (
                        <button
                          key={item?.id}
                          onClick={() => handleChoiceOptionClick(item)}
                          className={`min-w-[80px] items-center px-3 py-1 text-md font-medium text-center border border-[#d97706] rounded-lg ${selectedChoiceOption?.some(option => option.id === item?.id)
                            ? "bg-[#D97706] text-white" : "bg-white text-[#d97706]"} hover:text-white hover:bg-[#D97706]`}
                        >
                          <span>{item?.name} </span>
                          <span className="text-sm font-semibold">
                            {item?.price && parseFloat(item.price).toFixed(2) !== "0.00"
                              ? `(£ ${parseFloat(item.price).toFixed(2)})`
                              : ""}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )} */}

                {choice_options?.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-lg mb-1">Choice Options: </h5>

                    {/* Show error if a REQUIRED choice (min_selections=1) is missing */}
                    {choice_options.some(
                      (item) =>
                        item.min_selections === 1 &&  // Must select at least 1
                        item.max_selections === 1 &&  // Cannot select more than 1
                        !selectedChoiceOption.some(
                          (option) => option.choice_name === selectedChoice?.name
                        )
                    ) && (
                        <p className="text-red-600 text-sm font-semibold mb-2">
                          Required: You must select one option from this choice.
                        </p>
                      )}

                    <div className="flex items-center gap-2 flex-wrap">
                      {choice_options?.map((item) => (
                        <button
                          key={item?.id}
                          onClick={() => handleChoiceOptionClick(item)}
                          className={`min-w-[80px] items-center px-3 py-1 text-md font-medium text-center border border-[#d97706] rounded-lg ${selectedChoiceOption?.some(option => option.id === item?.id)
                              ? "bg-[#D97706] text-white"
                              : "bg-white text-[#d97706]"
                            } hover:text-white hover:bg-[#D97706]`}
                        >
                          <span>{item?.name}</span>
                          {item?.price && parseFloat(item.price) !== 0 && (
                            <span className="text-sm font-semibold">
                              (£ {parseFloat(item.price).toFixed(2)})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mt-7 gap-4 border-slate-700 border-t pt-7">
                  <CounterBox quantity={quantity} setQuantity={setQuantity} />

                  <button
                    onClick={addToCart} // Call AddToCart on Button Click
                    className="px-4 py-2 w-full text-white bg-[#D97706] rounded-lg"
                  >
                    ADD TO CART
                  </button>
                </div>

                <div className="text-xl font-bold mt-6">
                  <span className="text-[#d97706]">Sub total</span> :{" "}
                  £ {totalPrice}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <MealsPopoup
        getMealId={getMealIdFun}
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        items={popupItems}
        title={popupTitle}
      />
    </>
  );
}
