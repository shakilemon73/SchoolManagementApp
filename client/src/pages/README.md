# Pages Directory

This directory contains all the page components used in the application routing system. Each page corresponds to a specific route defined in `App.tsx`.

## Directory Structure

The pages are organized by feature or module:

- `auth-page.tsx`: Authentication pages (login/register)
- `home-page.tsx`: Main landing page
- `responsive-dashboard.tsx`: Main dashboard with responsive layout
- `mobile-dashboard.tsx`: Mobile-specific dashboard
- `not-found.tsx`: 404 page

Feature-specific page directories:
- `calendar/`: Calendar-related pages
- `credits/`: Credit system pages
- `documents/`: Document generation pages
- `financial/`: Financial management pages
- `management/`: School management pages
- `notifications/`: Notification pages
- `settings/`: Settings pages

## Creating New Pages

Follow these guidelines when creating new pages:

1. **Naming Convention**: Use kebab-case for file names with the `.tsx` extension
2. **Component Name**: Use PascalCase for the component name (e.g., `FeaturePage`)
3. **File Location**: Place the file in the appropriate feature directory
4. **Route Registration**: Add the route in `App.tsx` using the appropriate component

### Page Structure Template

```tsx
import { useEffect, useState } from 'react';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { useTranslation } from '@/shared/i18n';
// Import other components...

/**
 * FeaturePage - Description of what this page does
 */
export default function FeaturePage() {
  const { t } = useTranslation();
  // State declarations
  const [data, setData] = useState([]);
  
  // Effects
  useEffect(() => {
    // Initialization logic
  }, []);
  
  // Event handlers
  const handleAction = () => {
    // Handle user actions
  };
  
  // Render
  return (
    <ModulePageLayout title={t('feature.title')}>
      {/* Page content */}
    </ModulePageLayout>
  );
}
```

## Page Components vs UI Components

- **Page Components**: Handle routing, data fetching, and overall layout
- **UI Components**: Reusable, presentational components that receive data via props

Pages should:
- Fetch data using React Query
- Handle route parameters
- Coordinate different UI components
- Maintain page-specific state
- Handle form submissions and user interactions at the page level

## Protected Routes

Most pages should be wrapped with the `ProtectedRoute` component in `App.tsx` to ensure authentication:

```tsx
<ProtectedRoute path="/feature-path" component={FeaturePage} />
```

## Mobile Responsiveness

Pages should implement responsive design or have separate mobile versions:

1. Use the `useMobile` hook to detect mobile devices
2. Use appropriate layout components based on the device:
   - `ModulePageLayout` for desktop
   - `MobilePageLayout` for mobile

Example:
```tsx
import { useMobile } from '@/hooks/use-mobile';
import { ModulePageLayout } from '@/components/layout/module-page-layout';
import { MobilePageLayout } from '@/components/layout/mobile-page-layout';

export default function FeaturePage() {
  const { isMobile } = useMobile();
  
  if (isMobile) {
    return (
      <MobilePageLayout title="Feature">
        {/* Mobile content */}
      </MobilePageLayout>
    );
  }
  
  return (
    <ModulePageLayout title="Feature">
      {/* Desktop content */}
    </ModulePageLayout>
  );
}
```

## Internationalization

All user-facing text in pages should use the translation system:

```tsx
import { useTranslation } from '@/shared/i18n';

export default function FeaturePage() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('feature.title')}</h1>
      <p>{t('feature.description')}</p>
    </div>
  );
}
```