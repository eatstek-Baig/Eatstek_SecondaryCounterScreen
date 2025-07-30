import React, { useEffect, useState, useMemo } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import CounterBox from "../common/CounterBox";
import { useCart } from "react-use-cart";
import DealsPopup from "../common/DealsPopup";
import { FaCirclePlus } from "react-icons/fa6";
import { showToast } from "../../lib/utils/helpers";
import { LIVE_URL } from "../../lib/services/api/httpClient";
import { ToastContainer } from "react-toastify";
import { productApi } from "../../lib/services";

export default function DealDetails(props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState((props.selected_deal?.lines[0]?.pricing_value || "").split(" ")[0]);
  const [fromProducts, setFromProducts] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [indexWise, setIndexWise] = useState("");
  const [choices, setChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [choice_options, setChoice_options] = useState([]);
  const [selectedChoiceOption, setSelectedChoiceOption] = useState([]);
  const [inventoryData, setInventoryData] = useState(null);

  // Helper function to check if an item is in stock
  const isItemInStock = (skuRef, optionRef = null) => {
    // Check if inventoryData exists and is an array
    if (!inventoryData || !Array.isArray(inventoryData)) {
      return true; // Show if no inventory data or invalid data
    }
    
    // Check by sku_ref first
    if (skuRef) {
      const skuItem = inventoryData.find(item => item && item.sku_ref === skuRef);
      if (skuItem) {
        return skuItem.stock === null || skuItem.stock === undefined || skuItem.stock > 0;
      }
    }
    
    // Check by option_ref if provided
    if (optionRef) {
      const optionItem = inventoryData.find(item => item && item.option_ref === optionRef);
      if (optionItem) {
        return optionItem.stock === null || optionItem.stock === undefined || optionItem.stock > 0;
      }
    }
    
    // If not found in inventory data, show it (assume available)
    return true;
  };

  // Filter available choice options based on stock
  const getAvailableChoiceOptions = (options) => {
    if (!options) return [];
    
    return options.filter(option => {
      const optionRef = option.option_ref || option.ref || option.hubrise_ref;
      return isItemInStock(null, optionRef);
    });
  };

  // Filter available SKUs based on stock
  const getAvailableSKUs = (skus) => {
    if (!skus) return [];
    
    return skus.filter(sku => {
      const skuRef = sku.sku_ref || sku.ref || sku.hubrise_ref;
      return isItemInStock(skuRef);
    });
  };

  const fetchHubriseInventory = async () => {
    try {
      const response = await productApi.getHubriseStock();
      console.log("Hubrise Inventory Response:", response);
      
      // Handle the nested data structure
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setInventoryData(response.data.data);
        console.log("Inventory data set:", response.data.data);
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback if the structure is different
        setInventoryData(response.data);
      } else {
        console.warn("Inventory data is not in expected format:", response);
        setInventoryData([]);
      }
    } catch (error) {
      console.error("Error fetching Hubrise inventory:", error);
      showToast("Error fetching inventory data", "error");
      setInventoryData([]); // Set empty array on error
    }
  };

  const [dealItems, setDealItems] = useState(() => {
    const selectedDeal = props.selected_deal?.item;
    const totalPrice = props.selected_deal?.item?.lines[0]?.pricing_value || 0;
    const quantity = props.selected_deal?.quantity || 1;

    const generateUniqueId = () => {
      return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };

    return {
      id: `${selectedDeal?.id}_${generateUniqueId()}`,
      name: selectedDeal?.name,
      image: selectedDeal?.image_data[0],
      sprice: (parseFloat(totalPrice) / quantity).toFixed(2),
      tprice: (parseFloat(totalPrice) / quantity).toFixed(2),
      description: selectedDeal?.description,
      product_name: selectedDeal?.name,
      productId: selectedDeal?.category_id,
      deal_id: selectedDeal?.id,
      price: (parseFloat(totalPrice) / quantity).toFixed(2),
      choiceCategory: selectedDeal?.lines?.map((addon) => addon.label),
      quantity: quantity,
      deal: true,
      selectedProducts: selectedDeal?.lines?.map((category) => ({
        category_id: category.id,
        category_name: category.label,
        quantity: 0,
        selected_products: Array.from({ length: 1 }).map(
          () => ({})
        ),
      })) || [],
      singleItems: selectedDeal?.lines?.map((category) => ({
        category_id: category.id,
        label: category.label,
        skus: category.skus
      })) || []
    };
  });

  console.log("Data", dealItems);

  // Fetch inventory when component mounts
  useEffect(() => {
    if (props.selected_deal) {
      fetchHubriseInventory();
    }
  }, [props.selected_deal]);

  useEffect(() => {
    if (!props.selected_deal?.lines || !props.allData?.catalogs?.[0]?.data?.option_lists) return;

    const updatedSelectedProducts = props.selected_deal.lines.map((category) => {
      const matchingCategory = props.selected_deal.lines.find(
        (item) => item.id === category.id
      );

      // Filter available SKUs first
      const availableSKUs = getAvailableSKUs(matchingCategory?.skus || []);

      // Auto-select if only 1 valid product exists in the category
      if (availableSKUs.length === 1) {
        const singleProduct = availableSKUs[0];
        
        // Get filtered choices for this product
        const orderMap = {};
        singleProduct.sku_options?.forEach((id, index) => {
          orderMap[id] = index;
        });

        const filteredChoices = props?.allData?.catalogs[0]?.data?.option_lists
          .filter(item => singleProduct.sku_options?.includes(item.hubrise_id))
          .sort((a, b) => orderMap[a.hubrise_id] - orderMap[b.hubrise_id])
          .map(choice => ({
            ...choice,
            options: getAvailableChoiceOptions(choice.options || [])
          }))
          .filter(choice => choice.options.length > 0); // Only keep choices that have available options

        // Auto-select default choices (required choices with min_selections = 1)
        const defaultChoices = [];
        filteredChoices.forEach(choice => {
          if (choice.min_selections === 1 && choice.options?.length > 0) {
            const defaultOption = choice.options[0];
            defaultChoices.push({
              ...defaultOption,
              choice_name: choice.name,
              sku_id: singleProduct.sku_id
            });
          }
        });

        return {
          category_id: category.id,
          category_name: category.label,
          quantity: 1,
          selected_products: [{
            product_name: singleProduct.sku_product_name,
            pid: singleProduct.id,
            category_id: singleProduct.deal_line_id,
            sku_id: singleProduct.sku_id,
            sku_options: singleProduct.sku_options || [],
            data_options: filteredChoices || [],
            choices: defaultChoices,
          }],
        };
      }

      // Handle multiple products - select first valid product and set defaults
      if (availableSKUs.length > 0) {
        const validProducts = availableSKUs.filter(sku =>
          !sku.sku_options || sku.sku_options.length === 0
        );

        if (validProducts.length > 0) {
          const firstProduct = validProducts[0];
          return {
            category_id: category.id,
            category_name: category.label,
            quantity: 0,
            selected_products: [{
              product_name: firstProduct?.sku_product_name,
              pid: firstProduct?.id,
              category_id: firstProduct?.deal_line_id,
              sku_id: firstProduct.sku_id,
              sku_options: firstProduct?.sku_options || [],
              choices: [],
            }],
          };
        }
      }

      // Fallback: Empty selection (no available SKUs)
      return {
        category_id: category.id,
        category_name: category.label,
        quantity: 0,
        selected_products: [{
          product_name: null,
          pid: null,
          category_id: category.id,
          sku_id: null,
          sku_options: [],
          choices: [],
        }],
      };
    });

    setDealItems((prev) => ({
      ...prev,
      selectedProducts: updatedSelectedProducts,
    }));
  }, [props.selected_deal, props.allData, inventoryData]);

  useEffect(() => {
    const allOptions = dealItems?.selectedProducts
      .flatMap(option => option.selected_products)
      .flatMap(product => product.data_options || []);

    setChoices(allOptions);
  }, [dealItems?.selectedProducts]);

  const [activeChoiceProduct, setActiveChoiceProduct] = useState(null);

  const handleChoiceClick = (choice, productId) => {
    // Check if the choice is "Make it a Meal" or "Make it a Meal (FC)"
    if (choice?.name === "Make it a Meal" || choice?.name === "Make it a Meal (FC)") {
      choice.min_selections = 0;
    }

    // Check if the same choice is already selected
    if (selectedChoice?.id === choice.id && activeChoiceProduct === productId) {
      setSelectedChoice(null);
      setChoice_options([]);
    } else {
      setActiveChoiceProduct(productId);
      setSelectedChoice(choice);
      
      // Filter and sort options based on stock availability
      const availableOptions = getAvailableChoiceOptions(choice?.options || []);
      const sortedOptions = availableOptions.sort((a, b) => {
        return (a.order || 0) - (b.order || 0);
      }).map((option) => ({
        ...option,
        min_selections: choice?.min_selections,
        max_selections: choice?.max_selections,
      }));

      setChoice_options(sortedOptions);
    }
  };

  const handleChoiceOptionClick = (option, sku_id) => {
    // Check if the option is still in stock before allowing selection
    const optionRef = option.option_ref || option.ref || option.hubrise_ref;
    if (!isItemInStock(null, optionRef)) {
      showToast(`${option.name} is out of stock!`, "error");
      return;
    }

    setSelectedChoiceOption((prev) => {
      const choiceName = selectedChoice?.name;
      const isRequiredChoice = option.min_selections === 1 && option.max_selections === 1;

      const updatedSelectedProducts = dealItems?.selectedProducts.map((product) => {
        const updatedProducts = product?.selected_products?.map((selected) => {
          if (selected.sku_id === sku_id) {
            const currentChoices = selected.choices || [];
            const isAlreadySelected = currentChoices?.some((item) => item.id === option.id);

            if (isRequiredChoice) {
              const filteredChoices = currentChoices?.filter(
                (item) => item.choice_name !== choiceName
              );

              return {
                ...selected,
                choices: isAlreadySelected
                  ? filteredChoices
                  : [...filteredChoices,
                  { ...option, choice_name: choiceName, sku_id }],
              };
            } else {
              return {
                ...selected,
                choices: isAlreadySelected
                  ? currentChoices.filter((item) => item.id !== option.id)
                  : [...currentChoices, { ...option, choice_name: choiceName, sku_id }],
              };
            }
          }
          return selected;
        });

        return { ...product, selected_products: updatedProducts };
      });

      setDealItems((prev) => ({
        ...prev,
        selectedProducts: updatedSelectedProducts,
      }));

      return updatedSelectedProducts.flatMap((product) =>
        product.selected_products.flatMap((p) => p.choices || [])
      );
    });
  };

  const validateSelectedProducts = () => {
    return dealItems?.selectedProducts.every((category) =>
      category.selected_products.some(
        (product) => product.product_name && product.pid
      )
    );
  };

  useEffect(() => {
    if (dealItems?.selectedProducts) {
      const filteredChoices = dealItems.selectedProducts
        .flatMap((product) => product.selected_products)
        .flatMap((selectedProduct) => selectedProduct.data_options || [])
        .filter(
          (choice) =>
            choice?.name !== "Make it a Meal" && choice?.name !== "Make it a Meal (FC)"
        );

      setChoices(filteredChoices);
    }
  }, [dealItems?.selectedProducts]);

  const computedTotalPrice = useMemo(() => {
    setDealItems((prev) => ({
      ...prev,
      quantity: quantity,
    }));

    let basePrice = parseFloat((props.selected_deal?.lines[0]?.pricing_value || "0").split(" ")[0]);

    const choiceOptionsPrice = dealItems.selectedProducts
      .flatMap(product => product.selected_products)
      .flatMap(selected => selected.choices || [])
      .reduce((total, choice) => total + (parseFloat(choice.price) || 0), 0);

    return (basePrice + choiceOptionsPrice) * quantity;
  }, [quantity, dealItems.selectedProducts]);

  useEffect(() => {
    setTotalPrice(computedTotalPrice.toFixed(2));
  }, [computedTotalPrice]);

  const handleData = (id, name, index) => {
    setPopupTitle(name);
    setIndexWise(index);
    const getProducts = props.selected_deal?.lines?.find(
      (item) => item.id === id
    );
    
    // Filter products based on stock availability
    const availableProducts = getAvailableSKUs(getProducts?.skus || []);
    setFromProducts(availableProducts);
    setOpenPopup(true);
    setChoices([]);
    setSelectedChoice("");
    setChoice_options([]);
  };

  const addToCart = () => {
    if (!validateSelectedProducts()) {
      showToast("Please select Products from all Categories", "error");
      return;
    }

    // Check if selected products are still in stock
    const outOfStockProducts = dealItems.selectedProducts.some(category => {
      return category.selected_products.some(product => {
        if (!product.sku_id) return false;
        
        // Check if the main product is in stock
        const skuRef = product.sku_ref || product.ref || product.hubrise_ref;
        if (!isItemInStock(skuRef)) {
          showToast(`${product.product_name} is out of stock!`, "error");
          return true;
        }

        // Check if selected choices are in stock
        return (product.choices || []).some(choice => {
          const optionRef = choice.option_ref || choice.ref || choice.hubrise_ref;
          if (!isItemInStock(null, optionRef)) {
            showToast(`${choice.name} is out of stock!`, "error");
            return true;
          }
          return false;
        });
      });
    });

    if (outOfStockProducts) {
      return;
    }

    const missingRequiredChoices = dealItems.selectedProducts.some(category => {
      return category.selected_products.some(product => {
        if (!product.data_options) return false;
        
        const requiredChoices = product.data_options.filter(
          choice => choice.min_selections === 1 && choice.max_selections === 1
        );

        return requiredChoices.some(requiredChoice => {
          const selectedOptions = (product.choices || []).filter(
            option => option.choice_name === requiredChoice.name
          );
          
          return selectedOptions.length === 0;
        });
      });
    });

    if (missingRequiredChoices) {
      showToast("Please select all required options for each product", "error");
      return;
    }

    const updatedDealItems = {
      ...dealItems,
      tprice: computedTotalPrice.toFixed(2),
      sprice: computedTotalPrice.toFixed(2),
      price: (computedTotalPrice / quantity).toFixed(2),
    };

    addItem(updatedDealItems, quantity);
    props.closeModal(false);
  };

  useEffect(() => {
    const filteredChoices = dealItems?.selectedProducts?.data_options?.filter(
      choice => choice?.name !== "Make it a Meal" && choice?.name !== "Make it a Meal (FC)"
    );

    setChoices(filteredChoices);
  }, [dealItems?.selectedProducts?.data_options]);

  const getDealData = (data) => {
    setOpenPopup(false);
    console.log(data);
    
    // Check if the selected product is still in stock
    const skuRef = data.sku_ref || data.ref || data.hubrise_ref;
    if (!isItemInStock(skuRef)) {
      showToast(`${data.product_name} is out of stock!`, "error");
      return;
    }
    
    const orderMap = {};
    data?.sku_options?.forEach((id, index) => {
      orderMap[id] = index;
    });

    const filteredChoices = props?.allData?.catalogs[0]?.data?.option_lists
      .filter(item => data?.sku_options?.includes(item.hubrise_id))
      .sort((a, b) => orderMap[a.hubrise_id] - orderMap[b.hubrise_id])
      .map(choice => ({
        ...choice,
        options: getAvailableChoiceOptions(choice.options || [])
      }))
      .filter(choice => choice.options.length > 0);

    const defaultChoices = [];
    filteredChoices.forEach(choice => {
      if (choice.min_selections === 1 && choice.options?.length > 0) {
        const defaultOption = choice.options[0];
        defaultChoices.push({
          ...defaultOption,
          choice_name: choice.name,
          sku_id: data.sku_id
        });
      }
    });

    const updatedSelectedProducts = dealItems.selectedProducts.map(
      (product) => {
        if (product.category_id === data.category_id) {
          const updatedSelectedProducts = [...product.selected_products];
          if (indexWise < updatedSelectedProducts.length) {
            updatedSelectedProducts[indexWise] = {
              product_name: data.product_name,
              pid: data.pid,
              category_id: data.category_id,
              sku_id: data.sku_id,
              sku_options: data?.sku_options,
              choices: defaultChoices,
              data_options: filteredChoices || [],
            };
          } else {
            updatedSelectedProducts.push({
              product_name: data.product_name,
              pid: data.pid,
              category_id: data.category_id,
              sku_id: data.sku_id,
              sku_options: data?.sku_options,
              choices: defaultChoices,
              data_options: filteredChoices || [],
            });
          }
          return {
            ...product,
            selected_products: updatedSelectedProducts,
          };
        }
        return product;
      }
    );

    const newChoiceOptions = updatedSelectedProducts
      .flatMap(product => product.selected_products)
      .flatMap(p => p.choices || []);
    
    setSelectedChoiceOption(newChoiceOptions);

    setDealItems((prev) => ({
      ...prev,
      selectedProducts: updatedSelectedProducts,
    }));
  };

  return (
    <>
      <ToastContainer />
      <div className="z-[2] grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-[20px] md:gap-6 items-stretch w-full">
        <div className="p-4 flex">
          <div>
            <LazyLoadImage
              className="rounded-t-lg"
              alt={`${dealItems?.image}-image`}
              src={
                dealItems?.image
                  ? `${dealItems?.image}`
                  : "/dummy-image.webp"
              }
            />
          </div>
        </div>
        <div className="p-4">
          <div className="p-5 pt-0">
            <h4 className="mb-2 text-2xl font-bold tracking-tight text-[#d97706] dark:text-white uppercase">
              {dealItems?.name}
            </h4>
            <div className="text-xl font-bold mb-2">
              <span className="text-black">£ {dealItems?.tprice}</span>
            </div>
            {dealItems?.description && (
              <p className="text-black mb-3">{dealItems?.description}</p>
            )}

            {dealItems?.tags?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {dealItems.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-[#d97706] text-white text-xs font-semibold px-3 py-1 rounded-full uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {dealItems?.selectedProducts?.length > 0 && (
              <>
                <h5 className="text-lg mb-1 font-bold text-[#d97766]">
                  Included:{" "}
                </h5>
                <div className="flex gap-3 flex-col">
                  {dealItems?.selectedProducts?.map((item, index) => {
                    // Check if this category has any available products
                    const categoryProducts = props.selected_deal?.lines?.find(
                      (line) => line.id === item.category_id
                    );
                    const hasAvailableProducts = getAvailableSKUs(categoryProducts?.skus || []).length > 0;

                    return (
                      <div key={index} className="block">
                        <h6 className="text-md mb-1 font-bold">
                          {item?.category_name}
                          {!hasAvailableProducts && (
                            <span className="text-red-600 text-sm font-normal ml-2">
                              (Out of Stock)
                            </span>
                          )}
                        </h6>
                        {item?.selected_products.map((itembox, i) => {
                          return itembox?.product_name ? (
                            <>
                              <div
                                key={i}
                                onClick={() => hasAvailableProducts && handleData(
                                  item?.category_id,
                                  item?.category_name,
                                  i
                                )}
                                className={`mb-1 transition-all ${
                                  hasAvailableProducts 
                                    ? "cursor-pointer text-gray-600 hover:underline hover:text-blue-700" 
                                    : "cursor-not-allowed text-gray-400"
                                }`}
                              >
                                {itembox?.product_name}{" "}
                              </div>
                              
                              {
                                itembox?.data_options?.filter(choice => {
                                  const lowerName = choice?.name?.toLowerCase();
                                  return lowerName !== "make it a meal" && lowerName !== "make it a meal (fc)";
                                }).length > 0 && (
                                  <div className="mt-2">
                                    <h5 className="text-lg mb-1">Choices: </h5>
                                    <div className="flex items-center gap-2">
                                      {itembox?.data_options
                                        ?.filter(choice => {
                                          const lowerName = choice?.name?.toLowerCase();
                                          return lowerName !== "make it a meal" && lowerName !== "make it a meal (fc)";
                                        })
                                        .map((choice) => {
                                          // Check if choice has any available options
                                          const availableOptions = getAvailableChoiceOptions(choice.options || []);
                                          const hasAvailableOptions = availableOptions.length > 0;
                                          
                                          return (
                                            <button
                                              key={choice?.id}
                                              onClick={() => hasAvailableOptions && handleChoiceClick(choice, itembox?.pid)}
                                              disabled={!hasAvailableOptions}
                                              className={`min-w-[80px] items-center px-3 py-1 text-md font-medium text-center border border-[#d97706] rounded-lg ${
                                                !hasAvailableOptions
                                                  ? "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300"
                                                  : selectedChoice?.id === choice?.id && activeChoiceProduct === itembox?.pid
                                                    ? "bg-[#D97706] text-white"
                                                    : "bg-white text-[#d97706] hover:text-white hover:bg-[#D97706]"
                                              }`}
                                            >
                                              {choice?.name}
                                              {!hasAvailableOptions && (
                                                <span className="text-xs block">(Out of Stock)</span>
                                              )}
                                            </button>
                                          );
                                        })}
                                    </div>
                                  </div>
                                )
                              }

                              {
                                selectedChoice && activeChoiceProduct === itembox?.pid && choice_options?.length > 0 && (
                                  <div className="mt-3">
                                    <h5 className="text-lg mb-1">Choice Options: </h5>
                                    {choice_options.some(
                                      (item) =>
                                        item.min_selections === 1 &&
                                        item.max_selections === 1 &&
                                        !selectedChoiceOption.some(
                                          (option) =>
                                            option.choice_name === selectedChoice?.name &&
                                            option.sku_id === itembox?.sku_id
                                        )
                                    ) && (
                                        <p className="text-red-600 text-sm font-semibold mb-2">
                                          Required, You must select one of these Options
                                        </p>
                                      )}
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {choice_options?.map((item) => (
                                        <button
                                          key={item?.id}
                                          onClick={() => handleChoiceOptionClick(item, itembox?.sku_id)}
                                          className={`min-w-[80px] items-center px-3 py-1 text-md font-medium text-center border border-[#d97706] rounded-lg ${selectedChoiceOption?.some(
                                            (option) => option.id === item?.id && option.sku_id === itembox?.sku_id
                                          )
                                              ? "bg-[#D97706] text-white"
                                              : "bg-white text-[#d97706]"
                                            } hover:text-white hover:bg-[#D97706]`}
                                        >
                                          <span>{item?.name}</span>
                                          <span className="text-sm font-semibold">
                                            {item?.price && parseFloat(item.price).toFixed(2) !== "0.00"
                                              ? `(£ ${parseFloat(item.price).toFixed(2)})`
                                              : ""}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )
                              }

                            </>
                          ) : (
                            <button
                              key={i}
                              onClick={() => hasAvailableProducts && handleData(
                                item?.category_id,
                                item?.category_name,
                                i
                              )}
                              disabled={!hasAvailableProducts}
                              className={`min-w-auto h-[35px] mb-1 flex gap-3 items-center px-3 py-1 text-md font-medium text-center border border-[#d97706] rounded-lg ${
                                hasAvailableProducts
                                  ? "hover:text-white hover:bg-[#D97706] bg-white text-[#d97706]"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300"
                              }`}
                            >
                              <FaCirclePlus /> {item?.category_name} Item{" "}
                              {i + 1}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="flex justify-between items-center mt-7 gap-4 border-slate-700 border-t pt-7">
              <CounterBox quantity={quantity} setQuantity={setQuantity} />
              <button
                onClick={addToCart}
                className="px-4 py-2 w-full text-white bg-[#D97706] rounded-lg"
              >
                ADD TO CART
              </button>
            </div>        

            <div className="text-xl font-bold mt-6">
              <span className="text-[#d97706]">Sub total</span> : £ {totalPrice}
            </div>
          </div>
        </div>
      </div>

      <DealsPopup
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        getDealData={getDealData}
        items={fromProducts}
        title={popupTitle}
      />
    </>
  );
}