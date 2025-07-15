import React from 'react';
import { FaEye } from 'react-icons/fa6';

// Utility function to safely access nested object properties
const getNestedValue = (obj, key) => {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj);
};

// Reusable Table Header Component
const TableHeader = ({ headers, actionTitle, revert }) => (
  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
    <tr>
      {headers?.map((header, index) => (
        <th key={index} scope="col" className="px-6 py-3">
          {typeof header === 'string' ? header : header?.name}
        </th>
      ))}
      {revert && <th className="px-6 py-3">Revert To Kitchen</th>}
      {actionTitle && <th className="px-6 py-3">{actionTitle}</th>}
    </tr>
  </thead>
);

// Reusable Table Row Component
const TableRow = ({ row, headers, action, revert, openPopupFun, openCardPop }) => (
  <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
    {headers?.map((header, index) => (
      <td key={index} className="px-6 py-4 whitespace-nowrap">
        {/* Custom rendering for 'product_name' */}
        {typeof header === 'object' && header?.slug === 'product_name' ? (
          <div className="flex items-center gap-2 hover:text-[#d97766] cursor-pointer" onClick={() => openPopupFun(row)}>
            <span>View Receipt</span>
            <span className="mr-2">
              <FaEye />
            </span>
          </div>
        ) : (
          // Default rendering with nested key support
          typeof header === 'object' && header?.slug
            ? getNestedValue(row, header.slug) || (header?.slug === 'employee_name' ? 'N/A' : '')
            : ''
        )}
        {typeof header === 'object' &&
          header?.slug === 'card_details' &&
          row?.sale_transactions !== null &&
          row?.sale_transactions !== "null" && (
            <div
              className="flex items-center gap-2 hover:text-[#d97766] cursor-pointer"
              onClick={() => openCardPop(row)}
            >
              <span>Payment Details</span>
              <span className="mr-2">
                <FaEye />
              </span>
            </div>
          )}
      </td>
    ))}
    {revert && (
      <td className="px-6 py-4">{revert(row)}</td>
    )}
    {action && (
      <td className="px-6 py-4">{action(row)}</td>
    )}
  </tr>
);

// Reusable Table Component
const CustomTable = ({ headers, data = [], action, actionTitle, revert, openPopupFun, openCardPop }) => (
  <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table className="w-full text-lg text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <TableHeader headers={headers} actionTitle={actionTitle} revert={revert} />
      <tbody>
        {Array.isArray(data) && data.length > 0 ? (
          data.map((row, index) => (
            <TableRow key={index} row={row} headers={headers} action={action} revert={revert} openPopupFun={openPopupFun} openCardPop={openCardPop} />
          ))
        ) : (
          <tr>
            <td colSpan={headers?.length + (action ? 1 : 0)} className="text-center py-4">
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default CustomTable;
