import { useCallback, useState } from "react";
import type { TemplateList } from "../types/template";

const mockTemplatesFromGithub: TemplateList = {
  header: {
    "/template.json": {
      code: `{
  "id": "header",
  "name": "Header",
  "description": "Навигационная панель с логотипом и меню",
  "version": "1.0.0",
  "attributes": {
      "title": "Logo"
  },
  "files": {
    "html": "/index.html",
    "css": ["/styles.css"],
    "js": ["/scripts.js"]
  },
  "dependencies": {
    "fonts": [],
    "libraries": []
  }
}`,
    },
    "/index.html": {
      code: `<header class="main-header">
  <div class="container">
    <div class="logo">{title=Logo}</div>
    <nav class="nav">
      <a href="#home">Главная</a>
      <a href="#about">О нас</a>
      <a href="#contact">Контакты</a>
    </nav>
  </div>
</header>`,
    },
    "/styles.css": {
      code: `.main-header {
  background: #333;
  color: white;
  padding: 1rem 0;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
}
.logo {
  font-size: 1.5rem;
  font-weight: bold;
}
.nav a {
  color: white;
  text-decoration: none;
  margin-left: 2rem;
  transition: color 0.3s;
}
.nav a:hover {
  color: #ccc;
}`,
    },
    "/scripts.js": {
      code: `// Header navigation script
document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.main-header .nav a');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Navigation clicked:', this.textContent);
    });
  });
});`,
    },
    "/README.md": {
      code: `# Header Simple Template

Простой шаблон навигационной панели с логотипом и меню.

## Использование
Вставляется в начало body элемента.

## Настройки
- {title=Logo} - заменить на название логотипа`,
    },
  },

  "hero-modern": {
    "/template.json": {
      code: `{
  "id": "hero-modern",
  "name": "Hero Section",
  "description": "Главная секция с заголовком и CTA кнопкой",
  "version": "1.2.0",
  "attributes": {
    "title": "Заголовок секции",
    "description": "Описание",
    "button1": "Текст основной кнопки",
    "button2": "Текст дополнительной кнопки"
  },
  "files": {
    "html": "/index.html",
    "css": ["/styles.css"],
    "js": ["/scripts.js"]
  },
  "dependencies": {
    "fonts": ["https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"],
    "libraries": [{
      "url": "https://unpkg.com/aos@2.3.1/dist/aos.css",
      "location": "head-end"
    }, {
      "url": "https://unpkg.com/aos@2.3.1/dist/aos.js",
      "location": "head-end"
    }]
  }
}`,
    },
    "/index.html": {
      code: `<section class="hero-section" data-aos="fade-up">
  <div class="hero-container">
    <div class="hero-content">
      <h1 class="hero-title">{title=Заголовок вашего проекта}</h1>
      <p class="hero-description">{description=Описание того, что делает ваш продукт особенным}</p>
      <div class="hero-actions">
        <button class="btn btn-primary">{button1=Начать}</button>
        <button class="btn btn-secondary">{button2=Узнать больше}</button>
      </div>
    </div>
    <div class="hero-image">
      <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5IZXJvIEltYWdlPC90ZXh0Pjwvc3ZnPg==" alt="Hero illustration" />
    </div>
  </div>
</section>`,
    },
    "/styles.css": {
      code: `.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 0;
  font-family: 'Inter', sans-serif;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-description {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #ff6b6b;
  color: white;
}

.btn-primary:hover {
  background: #ff5252;
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}

.hero-image img {
  width: 100%;
  border-radius: 12px;
}

@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
}`,
    },
    "/scripts.js": {
      code: `// Hero section functionality
(function() {
  'use strict';
  
  function initHero() {
    // Инициализация AOS анимаций
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic'
      });
    }
    
    // Обработчики кнопок
    const primaryBtn = document.querySelector('.hero-section .btn-primary');
    const secondaryBtn = document.querySelector('.hero-section .btn-secondary');
    
    if (primaryBtn) {
      primaryBtn.addEventListener('click', function() {
        console.log('Primary CTA clicked');
      });
    }
    
    if (secondaryBtn) {
      secondaryBtn.addEventListener('click', function() {
        console.log('Secondary CTA clicked');
      });
    }
  }
  
  // Инициализация
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHero);
  } else {
    initHero();
  }
})();`,
    },
    "/README.md": {
      code: `# Hero Modern Template

Современный hero section с градиентным фоном и анимациями.

## Переменные:
- {title} - Заголовок секции
- {description} - Описание
- {button1} - Текст основной кнопки
- {button2} - Текст дополнительной кнопки

## Зависимости:
- Inter font
- AOS library для анимаций`,
    },
  },

  "card-product": {
    "/template.json": {
      code: `{
  "id": "card-product",
  "name": "Card",
  "description": "Компонент для отображения товара с изображением, названием и ценой",
  "version": "1.0.0",
  "attributes": {
      "title": "Название товара",
      "description": "Описание товара",
      "price": "Цена товара",
      "buttonText": "Текст кнопки",
      "alt": "Альтернативный текст для изображения"
  },
  "files": {
    "html": "/index.html",
    "css": ["/styles.css"],
    "js": ["/scripts.js"]
  },
  "dependencies": {
    "fonts": [],
    "libraries": []
  }
}`,
    },
    "/index.html": {
      code: `<div class="product-card">
  <div class="product-image-wrapper">
    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Ub3ZhcjwvdGV4dD48L3N2Zz4=" alt="{alt=Товар}" class="product-image">
  </div>
  <div class="product-info">
    <h3 class="product-title">{title=Название товара}</h3>
    <p class="product-description">{description=Краткое описание товара}</p>
    <div class="product-price">{price=1 000} ₽</div>
    <button class="product-btn" data-product-id="123">
      {buttonText=Купить}
    </button>
  </div>
</div>`,
    },
    "/styles.css": {
      code: `.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  max-width: 280px;
  transition: all 0.3s ease;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.product-image-wrapper {
  position: relative;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-info {
  padding: 1.25rem;
}

.product-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.product-description {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.product-price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #e74c3c;
  margin-bottom: 1rem;
}

.product-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.product-btn:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.product-btn:active {
  transform: translateY(0);
}`,
    },
    "/scripts.js": {
      code: `// Product card functionality
(function() {
  'use strict';
  
  function initProductCards() {
    const productBtns = document.querySelectorAll('.product-btn');
    
    productBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = this.getAttribute('data-product-id');
        const productTitle = this.closest('.product-card').querySelector('.product-title').textContent;
        
        console.log('Товар добавлен в корзину:', {
          id: productId,
          title: productTitle
        });
        
        // Временное уведомление
        this.textContent = 'Добавлено!';
        this.style.background = '#27ae60';
        
        setTimeout(() => {
          this.textContent = 'Купить';
          this.style.background = '';
        }, 2000);
      });
    });
  }
  
  // Инициализация
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProductCards);
  } else {
    initProductCards();
  }
})();`,
    },
    "/README.md": {
      code: `# Product Card Template

Карточка товара для интернет-магазина.

## Переменные:
- {title} - Название товара
- {description} - Описание товара
- {price} - Цена товара
- {buttonText} - Текст кнопки
- {alt} - Alt текст для изображения

## Использование:
Вставляется в контейнер .products-grid`,
    },
  },

  "footer-minimal": {
    "/template.json": {
      code: `{
  "id": "footer-minimal",
  "name": "Footer",
  "description": "Простой подвал с копирайтом и ссылками",
  "version": "1.0.0",
  "attributes": {
    "company": "Название компании"
  },
  "files": {
    "html": "/index.html",
    "css": ["/styles.css"],
    "js": ["/scripts.js"]
  },
  "dependencies": {
    "fonts": [],
    "libraries": []
  }
}`,
    },
    "/index.html": {
      code: `<footer class="site-footer">
  <div class="footer-container">
    <p>&copy; 2024 {company=Моя Компания}. Все права защищены.</p>
    <div class="footer-links">
      <a href="#privacy">Политика конфиденциальности</a>
      <a href="#terms">Условия использования</a>
    </div>
  </div>
</footer>`,
    },
    "/styles.css": {
      code: `.site-footer {
  background: #333;
  color: white;
  padding: 2rem 0;
  margin-top: 2rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
}

.footer-links a {
  color: #ccc;
  text-decoration: none;
  margin-left: 1rem;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: white;
}

@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}`,
    },
    "/scripts.js": {
      code: `// Footer functionality
console.log('Footer loaded');`,
    },
    "/README.md": {
      code: `# Footer Minimal Template

Минимальный подвал сайта.

## Переменные:
- {company} - Название компании

## Использование:
Вставляется в конец body элемента.`,
    },
  },
};

export const useTemplates = () => {
  const [templates, setTemplates] = useState<TemplateList>(
    mockTemplatesFromGithub
  );

  const onUpdateTemplates = useCallback(
    (templateKey: string, file: string, value: string) => {
      setTemplates((prevTemplates) => ({
        ...prevTemplates,
        [templateKey]: {
          ...prevTemplates[templateKey],
          [file]: {
            ...prevTemplates[templateKey][file],
            code: value,
          },
        },
      }));
    },
    []
  );

  return { templates, onUpdateTemplates };
};
