# Refactor Featured Products

## Overview

The **Refactor Featured Products** project is a front-end build setup designed to optimize and bundle assets for a featured products section. It leverages Webpack for efficient bundling, Sass for styling, and incorporates various plugins for image optimization and CSS processing. This setup aims to streamline the development process by automating common tasks like generating icons, optimizing images, and applying CSS preprocessing.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Project](#running-the-project)
- [Scripts](#scripts)
- [Technologies](#technologies)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Image Optimization**: Uses `sharp` and `image-minimizer-webpack-plugin` for efficient image resizing and optimization.
- **CSS Preprocessing**: Sass-based styling with `sass-loader` and autoprefixing through `autoprefixer`.
- **Development and Production Builds**: Runs different build configurations for development and production modes.
- **Automatic Icon Generation**: Custom script to generate and optimize product icons.
- **Webpack Configuration**: Includes various Webpack plugins to ensure an optimized final bundle.

## Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- **Node.js** (>= 14.x)
- **npm** (Node package manager)

You can download Node.js from [here](https://nodejs.org/).

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/PyGod/refactor-featured-products.git
   cd refactor-featured-products
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

### Running the Project

There are two main ways to run this project: in **development** mode or to **build** for production.

#### Development Mode

To start the development server and watch for changes:

```bash
npm run dev
```

This will:

- Generate product icons.
- Compile the Sass files.
- Start Webpack in development mode, watching for changes.

#### Build for Production

To create a production-ready build:

```bash
npm run build
```

This will:

- Generate product icons.
- Optimize images.
- Minify CSS and JavaScript files.
- Create the production bundle.

## Scripts

- **`npm run generate-icons`**: Runs the custom script to generate and optimize icons for the featured products section. Located in `scripts/generate-icons.js`.
- **`npm run dev`**: Runs the development build (`webpack --mode development --watch`), with live watching of file changes. Includes icon generation.
- **`npm run build`**: Runs the production build (`webpack --mode production`), optimized for performance. Includes icon generation.

## Technologies

- **Webpack**: Module bundler for JavaScript, CSS, and images.
- **Babel**: JavaScript compiler to convert ES6+ code to browser-compatible versions.
- **Sass**: CSS preprocessor for more dynamic and modular styles.
- **Autoprefixer**: Automatically adds vendor prefixes to CSS for cross-browser compatibility.
- **Sharp**: Image processing library for resizing and optimizing images.
- **CSS Minimization**: Reduces the size of the CSS output.
- **PostCSS**: CSS transformation tools, including autoprefixing and optimization.
- **Image Minimization**: Plugin for optimizing image assets during the build.

### Development Dependencies

- `webpack`, `webpack-cli`, `webpack-merge`: Core Webpack functionality.
- `@babel/core`, `babel-loader`: For transpiling modern JavaScript using Babel.
- `sass`, `sass-loader`: For compiling Sass to CSS.
- `mini-css-extract-plugin`, `css-loader`, `css-minimizer-webpack-plugin`: For handling CSS and minifying it.
- `image-minimizer-webpack-plugin`, `sharp`: For image optimization.
- `dotenv-webpack`: For managing environment variables in Webpack.

## Contributing

We welcome contributions! If you'd like to improve the project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -am 'Add new feature'`).
4. Push your changes to your fork (`git push origin feature-branch`).
5. Open a pull request to the `main` branch.

Please ensure that your changes are well-tested and include documentation if needed.

## License

This project is licensed under the [ISC License](LICENSE).

---

Let me know if you need further adjustments or additional sections in the README!
