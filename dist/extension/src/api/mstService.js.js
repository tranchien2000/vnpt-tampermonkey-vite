/**
 * @file mstService.js
 * @desc Dịch vụ tra cứu mã số thuế doanh nghiệp qua API VietQR.
 */

export const mstService = {
    /**
     * Tra cứu thông tin doanh nghiệp theo MST.
     * @param {string} mst - Mã số thuế cần tra cứu.
     * @returns {Promise<{name: string, address: string, representative: string, status: string}|null>}
     */
    async lookupMST(mst) {
        if (!mst || mst.length < 10) return null;

        const url = `https://api.vietqr.io/v2/business/${mst}`;
        
        try {
            const response = await fetch(url);
            const result = await response.json();

            if (result.code === '00' && result.data) {
                const { name, address, representative, status } = result.data;
                return {
                    name: name || '',
                    address: address || '',
                    representative: representative || '',
                    status: status || ''
                };
            }
            return null;
        } catch (error) {
            console.error('[MST Service] Error fetching MST:', error);
            return null;
        }
    }
};
