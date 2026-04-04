/**
 * i18n.js: A simple localization module for HCIE.
 * Handles string translations and UI updates for different languages.
 */

import { settingsManager } from './settings_manager.js';

const Dictionary = {
    tr: {
        'menu.file': 'Dosya',
        'menu.edit': 'Düzen',
        'menu.tools': 'Araçlar',
        'menu.image': 'Resim',
        'menu.layer': 'Katman',
        'menu.filter': 'Filtre',
        'menu.select': 'Seç',
        'menu.view': 'Görünüm',
        'menu.window': 'Pencere',
        'menu.help': 'Yardım',
        
        'file.new': 'Yeni',
        'file.open': 'Aç...',
        'file.recent': 'Son Kullanılanlar',
        'file.close': 'Kapat',
        'file.save': 'Kaydet',
        'file.save_as': 'Farklı Kaydet...',
        'file.export': 'Dışa Aktar...',
        'file.exit': 'Çıkış',
        
        'edit.undo': 'Geri Al',
        'edit.redo': 'Yinele',
        'edit.preferences': 'Ayarlar',
        
        'settings.title': 'Uygulama Ayarları',
        'settings.tab.general': 'Genel',
        'settings.tab.interface': 'Arayüz',
        'settings.tab.canvas': 'Çizim Alanı',
        'settings.tab.advanced': 'Gelişmiş',
        
        'settings.lang': 'Dil',
        'settings.theme': 'Tema',
        'settings.theme.dark': 'Koyu',
        'settings.theme.light': 'Açık',
        'settings.theme.system': 'Sistem',
        
        'settings.general.autoLoad': 'Başlangıçta Son Dosyayı Yükle',
        'settings.general.confirmExit': 'Çıkışta Onay İste',
        'settings.interface.accent': 'Vurgu Rengi',
        'settings.interface.scale': 'UI Ölçekleme',
        'settings.canvas.checkerSize': 'Damalı Desen Boyutu',
        'settings.canvas.checker1': 'Desen Rengi 1',
        'settings.canvas.checker2': 'Desen Rengi 2',
        'settings.canvas.rulers': 'Cetvelleri Göster',
        'settings.canvas.snap': 'Otomatik Hizalama (Snap)',
        'settings.advanced.gpu': 'GPU Hızlandırma',
        'settings.advanced.undo': 'Geri Al (Undo) Sınırı',
        'settings.advanced.reset': 'Ayarları Sıfırla',
        'settings.advanced.reset_confirm': 'Tüm ayarlar varsayılana sıfırlanacak. Emin misiniz?',
        
        'common.ok': 'Tamam',
        'common.cancel': 'İptal',
        'common.apply': 'Uygula',
        'common.reset': 'Sıfırla'
    },
    en: {
        'menu.file': 'File',
        'menu.edit': 'Edit',
        'menu.tools': 'Tools',
        'menu.image': 'Image',
        'menu.layer': 'Layer',
        'menu.filter': 'Filter',
        'menu.select': 'Select',
        'menu.view': 'View',
        'menu.window': 'Window',
        'menu.help': 'Help',
        
        'file.new': 'New',
        'file.open': 'Open...',
        'file.recent': 'Open Recent',
        'file.close': 'Close',
        'file.save': 'Save',
        'file.save_as': 'Save As...',
        'file.export': 'Export...',
        'file.exit': 'Exit',
        
        'edit.undo': 'Undo',
        'edit.redo': 'Redo',
        'edit.preferences': 'Preferences',
        
        'settings.title': 'Application Settings',
        'settings.tab.general': 'General',
        'settings.tab.interface': 'Interface',
        'settings.tab.canvas': 'Canvas',
        'settings.tab.advanced': 'Advanced',
        
        'settings.lang': 'Language',
        'settings.theme': 'Theme',
        'settings.theme.dark': 'Dark',
        'settings.theme.light': 'Light',
        'settings.theme.system': 'System',
        
        'settings.general.autoLoad': 'Auto-load Last File',
        'settings.general.confirmExit': 'Confirm on Exit',
        'settings.interface.accent': 'Accent Color',
        'settings.interface.scale': 'UI Scaling',
        'settings.canvas.checkerSize': 'Checkerboard Size',
        'settings.canvas.checker1': 'Checker Color 1',
        'settings.canvas.checker2': 'Checker Color 2',
        'settings.canvas.rulers': 'Show Rulers',
        'settings.canvas.snap': 'Snap to Grid/Ends',
        'settings.advanced.gpu': 'GPU Acceleration',
        'settings.advanced.undo': 'Undo Limit',
        'settings.advanced.reset': 'Reset All Settings',
        'settings.advanced.reset_confirm': 'All settings will be reset to defaults. Are you sure?',
        
        'common.ok': 'OK',
        'common.cancel': 'Cancel',
        'common.apply': 'Apply',
        'common.reset': 'Reset'
    },
    de: {
        'menu.file': 'Datei',
        'menu.edit': 'Bearbeiten',
        'menu.tools': 'Werkzeuge',
        'menu.image': 'Bild',
        'menu.layer': 'Ebene',
        'menu.filter': 'Filter',
        'menu.select': 'Auswahl',
        'menu.view': 'Ansicht',
        'menu.window': 'Fenster',
        'menu.help': 'Hilfe',
        
        'file.new': 'Neu',
        'file.open': 'Öffnen...',
        'file.recent': 'Zuletzt geöffnet',
        'file.close': 'Schließen',
        'file.save': 'Speichern',
        'file.save_as': 'Speichern unter...',
        'file.export': 'Exportieren...',
        'file.exit': 'Beenden',
        
        'edit.undo': 'Rückgängig',
        'edit.redo': 'Wiederholen',
        'edit.preferences': 'Einstellungen',
        
        'settings.title': 'Anwendungseinstellungen',
        'settings.tab.general': 'Allgemein',
        'settings.tab.interface': 'Oberfläche',
        'settings.tab.canvas': 'Leinwand',
        'settings.tab.advanced': 'Erweitert',
        
        'settings.lang': 'Sprache',
        'settings.theme': 'Thema',
        'settings.theme.dark': 'Dunkel',
        'settings.theme.light': 'Hell',
        'settings.theme.system': 'System',
        
        'settings.general.autoLoad': 'Zuletzt geöffnete Datei automatisch laden',
        'settings.general.confirmExit': 'Beim Beenden bestätigen',
        'settings.interface.accent': 'Akzentfarbe',
        'settings.interface.scale': 'UI-Skalierung',
        'settings.canvas.checkerSize': 'Schachbrettgröße',
        'settings.canvas.checker1': 'Schachbrettfarbe 1',
        'settings.canvas.checker2': 'Schachbrettfarbe 2',
        'settings.canvas.rulers': 'Lineale anzeigen',
        'settings.canvas.snap': 'Einrasten aktivieren',
        'settings.advanced.gpu': 'GPU-Beschleunigung',
        'settings.advanced.undo': 'Undo-Limit',
        'settings.advanced.reset': 'Alle Einstellungen zurücksetzen',
        'settings.advanced.reset_confirm': 'Alle Einstellungen werden auf die Standardwerte zurückgesetzt. Sind Sie sicher?',
        
        'common.ok': 'OK',
        'common.cancel': 'Abbrechen',
        'common.apply': 'Anwenden',
        'common.reset': 'Zurücksetzen'
    },
    fr: {
        'menu.file': 'Fichier',
        'menu.edit': 'Édition',
        'menu.tools': 'Outils',
        'menu.image': 'Image',
        'menu.layer': 'Calque',
        'menu.filter': 'Filtre',
        'menu.select': 'Sélection',
        'menu.view': 'Affichage',
        'menu.window': 'Fenêtre',
        'menu.help': 'Aide',
        
        'file.new': 'Nouveau',
        'file.open': 'Ouvrir...',
        'file.recent': 'Ouvrir récent',
        'file.close': 'Fermer',
        'file.save': 'Enregistrer',
        'file.save_as': 'Enregistrer sous...',
        'file.export': 'Exporter...',
        'file.exit': 'Quitter',
        
        'edit.undo': 'Annuler',
        'edit.redo': 'Rétablir',
        'edit.preferences': 'Préférences',
        
        'settings.title': 'Paramètres de l\'application',
        'settings.tab.general': 'Général',
        'settings.tab.interface': 'Interface',
        'settings.tab.canvas': 'Canevas',
        'settings.tab.advanced': 'Avancé',
        
        'settings.lang': 'Langue',
        'settings.theme': 'Thème',
        'settings.theme.dark': 'Sombre',
        'settings.theme.light': 'Clair',
        'settings.theme.system': 'Système',
        
        'settings.general.autoLoad': 'Charger automatiquement le dernier fichier',
        'settings.general.confirmExit': 'Confirmer à la sortie',
        'settings.interface.accent': 'Couleur d\'accentuation',
        'settings.interface.scale': 'Mise à l\'échelle de l\'UI',
        'settings.canvas.checkerSize': 'Taille du damier',
        'settings.canvas.checker1': 'Couleur du damier 1',
        'settings.canvas.checker2': 'Couleur du damier 2',
        'settings.canvas.rulers': 'Afficher les règles',
        'settings.canvas.snap': 'Activer le magnétisme',
        'settings.advanced.gpu': 'Accélération GPU',
        'settings.advanced.undo': 'Limite d\'annulation',
        'settings.advanced.reset': 'Réinitialiser tous les paramètres',
        'settings.advanced.reset_confirm': 'Tous les paramètres seront réinitialisés aux valeurs par défaut. Êtes-vous sûr ?',
        
        'common.ok': 'OK',
        'common.cancel': 'Annuler',
        'common.apply': 'Appliquer',
        'common.reset': 'Réinitialiser'
    },
    es: {
        'menu.file': 'Archivo',
        'menu.edit': 'Editar',
        'menu.tools': 'Herramientas',
        'menu.image': 'Imagen',
        'menu.layer': 'Capa',
        'menu.filter': 'Filtro',
        'menu.select': 'Seleccionar',
        'menu.view': 'Vista',
        'menu.window': 'Ventana',
        'menu.help': 'Ayuda',
        
        'file.new': 'Nuevo',
        'file.open': 'Abrir...',
        'file.recent': 'Abrir recientes',
        'file.close': 'Cerrar',
        'file.save': 'Guardar',
        'file.save_as': 'Guardar como...',
        'file.export': 'Exportar...',
        'file.exit': 'Salir',
        
        'edit.undo': 'Deshacer',
        'edit.redo': 'Rehacer',
        'edit.preferences': 'Preferencias',
        
        'settings.title': 'Configuración de la aplicación',
        'settings.tab.general': 'General',
        'settings.tab.interface': 'Interfaz',
        'settings.tab.canvas': 'Lienzo',
        'settings.tab.advanced': 'Avanzado',
        
        'settings.lang': 'Idioma',
        'settings.theme': 'Tema',
        'settings.theme.dark': 'Oscuro',
        'settings.theme.light': 'Claro',
        'settings.theme.system': 'Sistema',
        
        'settings.general.autoLoad': 'Cargar automáticamente el último archivo',
        'settings.general.confirmExit': 'Confirmar al salir',
        'settings.interface.accent': 'Color de acento',
        'settings.interface.scale': 'Escalado de la IU',
        'settings.canvas.checkerSize': 'Tamaño del tablero',
        'settings.canvas.checker1': 'Color del tablero 1',
        'settings.canvas.checker2': 'Color del tablero 2',
        'settings.canvas.rulers': 'Mostrar reglas',
        'settings.canvas.snap': 'Activar ajuste',
        'settings.advanced.gpu': 'Aceleración por GPU',
        'settings.advanced.undo': 'Límite de deshacer',
        'settings.advanced.reset': 'Restablecer todos los ajustes',
        'settings.advanced.reset_confirm': 'Todos los ajustes se restablecerán a los valores predeterminados. ¿Estás seguro?',
        
        'common.ok': 'Aceptar',
        'common.cancel': 'Cancelar',
        'common.apply': 'Aplicar',
        'common.reset': 'Restablecer'
    },
    ru: {
        'menu.file': 'Файл',
        'menu.edit': 'Правка',
        'menu.tools': 'Инструменты',
        'menu.image': 'Изображение',
        'menu.layer': 'Слой',
        'menu.filter': 'Фильтр',
        'menu.select': 'Выделение',
        'menu.view': 'Вид',
        'menu.window': 'Окно',
        'menu.help': 'Справка',
        
        'file.new': 'Новый',
        'file.open': 'Открыть...',
        'file.recent': 'Недавние',
        'file.close': 'Закрыть',
        'file.save': 'Сохранить',
        'file.save_as': 'Сохранить как...',
        'file.export': 'Экспорт...',
        'file.exit': 'Выход',
        
        'edit.undo': 'Отменить',
        'edit.redo': 'Вернуть',
        'edit.preferences': 'Настройки',
        
        'settings.title': 'Настройки приложения',
        'settings.tab.general': 'Общие',
        'settings.tab.interface': 'Интерфейс',
        'settings.tab.canvas': 'Холст',
        'settings.tab.advanced': 'Расширенные',
        
        'settings.lang': 'Язык',
        'settings.theme': 'Тема',
        'settings.theme.dark': 'Темная',
        'settings.theme.light': 'Светлая',
        'settings.theme.system': 'Системная',
        
        'settings.general.autoLoad': 'Автозагрузка последнего файла',
        'settings.general.confirmExit': 'Подтверждение при выходе',
        'settings.interface.accent': 'Акцентный цвет',
        'settings.interface.scale': 'Масштаб интерфейса',
        'settings.canvas.checkerSize': 'Размер сетки',
        'settings.canvas.checker1': 'Цвет сетки 1',
        'settings.canvas.checker2': 'Цвет сетки 2',
        'settings.canvas.rulers': 'Показать линейки',
        'settings.canvas.snap': 'Привязка к сетке',
        'settings.advanced.gpu': 'GPU ускорение',
        'settings.advanced.undo': 'Лимит отмены',
        'settings.advanced.reset': 'Сбросить все настройки',
        'settings.advanced.reset_confirm': 'Все настройки будут сброшены до значений по умолчанию. Вы уверены?',
        
        'common.ok': 'ОК',
        'common.cancel': 'Отмена',
        'common.apply': 'Применить',
        'common.reset': 'Сбросить'
    }
};

class I18n {
    constructor() {
        this.currentLang = settingsManager.get('general.language') || 'en';
    }

    t(key) {
        const langDict = Dictionary[this.currentLang] || Dictionary['tr'];
        return langDict[key] || key;
    }

    setLanguage(lang) {
        if (Dictionary[lang]) {
            this.currentLang = lang;
            this.updateUI();
        }
    }

    /**
     * Scans the document for elements with data-i18n attribute and updates them.
     */
    updateUI() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
        
        // Also update placeholders or titles if needed via data-i18n-title etc.
        const titled = document.querySelectorAll('[data-i18n-title]');
        titled.forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.setAttribute('title', this.t(key));
        });
    }
}

export const i18n = new I18n();
window.i18n = i18n;
window.t = (key) => i18n.t(key); // Fast access for inline scripts
