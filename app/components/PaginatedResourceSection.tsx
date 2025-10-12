import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 */

export function PaginatedResourceSection<NodesType>({
  connection,
  children,
}: Readonly<{
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
}>) {
  const [currentPage, setCurrentPage] = React.useState(1);
  
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink, hasNextPage, hasPreviousPage}) => {
        const resoucesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div className="w-full">
            {/* Products/Collections Grid - Centered */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {resoucesMarkup}
            </div>
            
            {/* Pagination Controls */}
            {(hasNextPage || hasPreviousPage) && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <PreviousLink
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    hasPreviousPage
                      ? 'bg-black text-white hover:bg-gray-800 focus:outline-2 focus:outline-black focus:outline-offset-2'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={() => hasPreviousPage && setCurrentPage((prev) => Math.max(1, prev - 1))}
                >
                  {isLoading ? 'Loading...' : '← Previous'}
                </PreviousLink>
                
                <span className="text-sm text-gray-600 font-medium">
                  Page {currentPage}
                </span>
                
                <NextLink
                  className={`px-4 py-2 rounded-md font-medium transition-all ${
                    hasNextPage
                      ? 'bg-black text-white hover:bg-gray-800 focus:outline-2 focus:outline-black focus:outline-offset-2'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={() => hasNextPage && setCurrentPage((prev) => prev + 1)}
                >
                  {isLoading ? 'Loading...' : 'Next →'}
                </NextLink>
              </div>
            )}
          </div>
        );
      }}
    </Pagination>
  );
}
