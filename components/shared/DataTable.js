import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronUp, ChevronDown } from 'lucide-react';

const DataTable = ({ data, columns, pageSize = 10 }) => {
const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
const [filterText, setFilterText] = useState('');
const [currentPage, setCurrentPage] = useState(1);

const filteredData = useMemo(() => {
if (!filterText) return data;
return data.filter(row =>
columns.some(col =>
String(row[col.key]).toLowerCase().includes(filterText.toLowerCase())
)
);
}, [data, filterText, columns]);

const sortedData = useMemo(() => {
const sortableItems = [...filteredData];
if (sortConfig.key) {
sortableItems.sort((a, b) => {
const aVal = a[sortConfig.key];
const bVal = b[sortConfig.key];

text
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
}
return sortableItems;
}, [filteredData, sortConfig]);

const requestSort = (key) => {
let direction = 'asc';
if (sortConfig.key === key && sortConfig.direction === 'asc') {
direction = 'desc';
}
setSortConfig({ key, direction });
};

const totalPages = Math.ceil(sortedData.length / pageSize);
const paginatedData = sortedData.slice(
(currentPage - 1) * pageSize,
currentPage * pageSize
);

return (
<div className="space-y-4">
<div className="flex justify-between items-center">
<div className="relative flex-1 max-w-sm">
<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
<input
type="text"
placeholder="Search table..."
className="pl-10 pr-4 py-2 border rounded-lg w-full"
value={filterText}
onChange={(e) => setFilterText(e.target.value)}
/>
</div>
<button className="btn-secondary flex items-center gap-2">
<Filter size={18} />
Filters
</button>
</div>

text
  <div className="overflow-x-auto border rounded-lg">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort(col.key)}
            >
              <div className="flex items-center gap-1">
                {col.label}
                {sortConfig.key === col.key && (
                  sortConfig.direction === 'asc' ? 
                    <ChevronUp size={16} /> : 
                    <ChevronDown size={16} />
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {paginatedData.map((row, index) => (
          <tr key={index} className="hover:bg-gray-50">
            {columns.map((col) => (
              <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  <div className="flex justify-between items-center">
    <div className="text-sm text-gray-500">
      Showing {paginatedData.length} of {filteredData.length} entries
    </div>
    <div className="flex gap-2">
      <button
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="btn-secondary"
      >
        Previous
      </button>
      <span className="px-4 py-2">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="btn-secondary"
      >
        Next
      </button>
    </div>
  </div>
</div>
);
};

export default DataTable;
