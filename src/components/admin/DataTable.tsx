import { useState, useMemo, ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  sortable?: boolean;
  sortKey?: keyof T;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  loading?: boolean;
  emptyState?: ReactNode;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  pageSize?: number;
  showPagination?: boolean;
}

const thStyle: React.CSSProperties = {
  padding: '16px 24px',
  fontSize: '11px',
  fontWeight: 700,
  color: '#888888',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  borderBottom: '2px solid #F0F0F0',
  backgroundColor: '#FAFAFA',
};

const tdStyle: React.CSSProperties = {
  padding: '18px 24px',
  fontSize: '14px',
  verticalAlign: 'middle',
};

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyState,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  pageSize = 10,
  showPagination = true,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    const column = columns.find((c) => c.key === sortKey);
    if (!column?.sortKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[column.sortKey as keyof T];
      const bVal = b[column.sortKey as keyof T];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection, columns]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = showPagination
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  const handleSort = (columnKey: string) => {
    const column = columns.find((c) => c.key === columnKey);
    if (!column?.sortable) return;

    if (sortKey === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(columnKey);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    const pageIds = paginatedData.map(keyExtractor);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    const newIds = new Set(selectedIds);
    if (allSelected) {
      pageIds.forEach((id) => newIds.delete(id));
    } else {
      pageIds.forEach((id) => newIds.add(id));
    }
    onSelectionChange(newIds);
  };

  const handleSelectRow = (id: string) => {
    if (!onSelectionChange) return;
    const newIds = new Set(selectedIds);
    if (newIds.has(id)) {
      newIds.delete(id);
    } else {
      newIds.add(id);
    }
    onSelectionChange(newIds);
  };

  const pageIds = paginatedData.map(keyExtractor);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const someSelected = pageIds.some((id) => selectedIds.has(id)) && !allSelected;

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #E5E5E5',
            borderTopColor: '#B8860B',
            borderRadius: '50%',
            margin: '0 auto',
          }}
          className="animate-spin"
        />
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {selectable && (
                <th style={{ ...thStyle, width: '52px', padding: '16px 20px' }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={handleSelectAll}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#B8860B' }}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable && handleSort(column.key)}
                  style={{
                    ...thStyle,
                    textAlign: (column.align || 'left') as any,
                    cursor: column.sortable ? 'pointer' : 'default',
                    userSelect: column.sortable ? 'none' : undefined,
                    width: column.width,
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {column.header}
                    {column.sortable && sortKey === column.key && (
                      <span style={{ color: '#B8860B' }}>
                        {sortDirection === 'asc' ? (
                          <ChevronUp style={{ width: '14px', height: '14px' }} />
                        ) : (
                          <ChevronDown style={{ width: '14px', height: '14px' }} />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => {
              const id = keyExtractor(item);
              const isSelected = selectedIds.has(id);

              return (
                <tr
                  key={id}
                  style={{
                    borderBottom: '1px solid #F0F0F0',
                    backgroundColor: isSelected ? 'rgba(184, 134, 11, 0.04)' : undefined,
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#FAFAFA';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  {selectable && (
                    <td style={{ ...tdStyle, width: '52px', padding: '18px 20px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#B8860B' }}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      style={{
                        ...tdStyle,
                        textAlign: (column.align || 'left') as any,
                      }}
                    >
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div
          style={{
            padding: '20px 24px',
            borderTop: '1px solid #F0F0F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <p style={{ fontSize: '13px', color: '#888888' }}>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: 'none',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.4 : 1,
                display: 'flex',
              }}
            >
              <ChevronLeft style={{ width: '18px', height: '18px', color: '#666666' }} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 7) return true;
                if (page === 1 || page === totalPages) return true;
                if (Math.abs(page - currentPage) <= 1) return true;
                return false;
              })
              .map((page, idx, arr) => {
                const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                return (
                  <span key={page} style={{ display: 'flex', alignItems: 'center' }}>
                    {showEllipsis && (
                      <span style={{ padding: '0 6px', color: '#AAAAAA', fontSize: '14px' }}>...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: currentPage === page ? '#B8860B' : 'transparent',
                        color: currentPage === page ? '#FFFFFF' : '#666666',
                        transition: 'all 0.15s',
                      }}
                    >
                      {page}
                    </button>
                  </span>
                );
              })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: 'none',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.4 : 1,
                display: 'flex',
              }}
            >
              <ChevronRight style={{ width: '18px', height: '18px', color: '#666666' }} />
            </button>
          </div>
        </div>
      )}

      {/* Selection count */}
      {selectable && selectedIds.size > 0 && (
        <div
          style={{
            padding: '16px 24px',
            backgroundColor: 'rgba(184, 134, 11, 0.08)',
            borderTop: '1px solid rgba(184, 134, 11, 0.15)',
            fontSize: '13px',
            fontWeight: 600,
            color: '#B8860B',
          }}
        >
          {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}
