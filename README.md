# Database Migration Utility

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14-brightgreen.svg)](https://nodejs.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)

A lightweight, production‑ready utility that manages versioned client‑side database migrations using **IndexedDB**. 
The project demonstrates modern HTML, CSS, and JavaScript patterns, comprehensive error handling, logging, and testing.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Testing](#testing)
- [License](#license)

## Features

- **Versioned migrations** written as plain JavaScript functions.
- Automatic detection and execution of pending migrations.
- Robust error handling with a pluggable logger.
- Simple UI to trigger migrations and view status.
- Fully typed with JSDoc annotations.
- Unit tests with Node's built‑in `assert` module.

## Prerequisites

- Node.js **≥14** (for development, building and testing)
- A modern browser that supports IndexedDB (Chrome, Firefox, Edge, Safari)

## Installation