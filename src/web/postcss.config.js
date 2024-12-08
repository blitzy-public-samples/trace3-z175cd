/*
Human Tasks:
1. Verify PostCSS plugins are installed in package.json with correct versions
2. Ensure TailwindCSS configuration is properly integrated with the build process
3. Test CSS transformations and optimizations in development and production environments
4. Validate vendor prefix generation for target browsers
*/

// postcss v8.x
// tailwindcss v3.x
// autoprefixer v10.x

/*
Requirement Addressed: Frontend Framework and Libraries
Location: Technical Specification/6. TECHNOLOGY STACK/Frontend Libraries
Description: Configures PostCSS to integrate with TailwindCSS and handle CSS transformations
*/

const { theme, plugins } = require('./tailwind.config.ts');

/*
Requirement Addressed: User Interface Design
Location: Technical Specification/5. SYSTEM DESIGN/User Interface Design
Description: Implements CSS processing pipeline for design system specifications
*/
module.exports = {
  plugins: [
    'tailwindcss',
    'autoprefixer',
    process.env.NODE_ENV === 'production' && [
      'cssnano',
      {
        preset: [
          'default',
          {
            discardComments: {
              removeAll: true,
            },
            normalizeWhitespace: false,
          },
        ],
      },
    ],
  ].filter(Boolean),
  
  // PostCSS configuration options
  options: {
    // Enable source maps in development
    sourceMap: process.env.NODE_ENV !== 'production',
    
    // Configure autoprefixer
    autoprefixer: {
      // Add vendor prefixes for the last 2 versions of browsers, not dead browsers, and IE 11
      browsers: ['> 1%', 'last 2 versions', 'not dead', 'IE 11'],
      
      // Enable Grid Layout prefixes
      grid: true,
    },
    
    // TailwindCSS configuration
    tailwindcss: {
      // Use the imported theme and plugins from tailwind.config.ts
      config: {
        theme,
        plugins,
      },
    },
  },
};