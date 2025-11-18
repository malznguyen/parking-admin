# Mock Images Directory

This folder contains placeholder images for the HaUI Smart Parking Dashboard.

## Required Images

The application expects the following mock images:

### Camera Captures
- **Entry Images**: `entry-1.jpg` to `entry-20.jpg` (20 images)
- **Exit Images**: `exit-1.jpg` to `exit-20.jpg` (20 images)

### Exception Images
- **Raw Exception Images**: `exception-raw-1.jpg` to `exception-raw-30.jpg` (30 images)
- **Processed Exception Images**: `exception-processed-1.jpg` to `exception-processed-30.jpg` (30 images)

## Image Requirements

- **Format**: JPG (recommended)
- **Dimensions**: 800x600 pixels (minimum)
- **Content**: License plate camera captures (simulated)

## Generating Placeholder Images

Since actual camera images are not available, the application will automatically fall back to using placeholder images from `https://placehold.co` service.

### Option 1: Use Online Placeholder Service (Automatic)

The `ParkingImage` component automatically falls back to `placehold.co` when images are missing. No action needed.

### Option 2: Download Real Placeholder Images

You can download sample images and rename them:

```bash
# Entry images (1-20)
for i in {1..20}; do
  curl "https://placehold.co/800x600/1e293b/94a3b8?text=Entry+$i" -o "entry-$i.jpg"
done

# Exit images (1-20)
for i in {1..20}; do
  curl "https://placehold.co/800x600/1e293b/94a3b8?text=Exit+$i" -o "exit-$i.jpg"
done

# Exception raw images (1-30)
for i in {1..30}; do
  curl "https://placehold.co/800x600/dc2626/fecaca?text=Exception+Raw+$i" -o "exception-raw-$i.jpg"
done

# Exception processed images (1-30)
for i in {1..30}; do
  curl "https://placehold.co/800x600/059669/a7f3d0?text=Processed+$i" -o "exception-processed-$i.jpg"
done
```

### Option 3: Use Real Camera Images

For a production demo, replace these placeholder files with actual license plate camera captures.

## Implementation Details

The application uses:
- **Image Helper Functions** (`lib/utils/image-helpers.ts`) - Random image selection
- **ParkingImage Component** (`components/parking-image.tsx`) - Smart image loading with fallbacks
- **Automatic Fallback** - Uses placehold.co when local images are missing

## Notes

- Images are loaded using Next.js `Image` component for optimization
- Loading states and error handling are built-in
- Fallback placeholders ensure the UI always displays something
- No broken image icons will appear - graceful degradation is implemented
