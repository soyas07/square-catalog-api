import { square } from "../square.js";
import { SquareError } from 'square';
import logger from '../middlewares/logger.js'

export const fetchImageObjects = async (imageIds) => {
    if (!imageIds || imageIds.length === 0) return [];
    
    try {
        const imageResponse = await square.catalog.batchGet({
            objectIds: imageIds
        });

        return imageResponse.objects.map(image => ({
            id: image.id,
            url: image.imageData.url
        }));
    } catch (ex) {
        if (ex instanceof SquareError)
            logger.error(`Error from Square API: `, ex.errors);
        else
            logger.error(`Error fetching images: ${ex}`);
        
        return [];
    }
};