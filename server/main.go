package main

import (
	"log"
	"os"
	"path/filepath"

	"snapkit/db"
	"snapkit/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Resolve paths relative to project root (parent of server/)
	rootDir := ".."
	if env := os.Getenv("SNAPKIT_ROOT"); env != "" {
		rootDir = env
	}
	dataDir := filepath.Join(rootDir, "data")
	brandsDir := filepath.Join(rootDir, "brands")

	// Set global dirs for handlers
	handlers.DataDir = dataDir
	handlers.BrandsDir = brandsDir

	// Init DB
	db.Init(dataDir)
	handlers.SeedBrands()

	// Gin router
	r := gin.Default()

	// CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:8080"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	// Auth routes (before middleware)
	r.GET("/login", handlers.HandleLogin)
	r.POST("/auth/login", handlers.HandleLoginPost)

	// Password gate (skip /login, /auth/login, static assets)
	r.Use(handlers.AuthMiddleware())

	// Static files
	r.Static("/brands", brandsDir)
	r.Static("/uploads", filepath.Join(dataDir, "uploads"))

	// Serve fonts from app/public/fonts or static/fonts
	fontsDir := filepath.Join(rootDir, "app", "public", "fonts")
	if _, err := os.Stat(fontsDir); err == nil {
		r.Static("/fonts", fontsDir)
	} else if _, err := os.Stat(filepath.Join(rootDir, "static", "fonts")); err == nil {
		r.Static("/fonts", filepath.Join(rootDir, "static", "fonts"))
	}

	// SPA: serve Vue build from static/ if it exists (production)
	staticDir := filepath.Join(rootDir, "static")
	if _, err := os.Stat(staticDir); err == nil {
		r.Static("/assets", filepath.Join(staticDir, "assets"))
		r.NoRoute(func(c *gin.Context) {
			// API 404s stay as JSON
			if len(c.Request.URL.Path) > 4 && c.Request.URL.Path[:5] == "/api/" {
				c.JSON(404, gin.H{"error": "not found"})
				return
			}
			c.File(filepath.Join(staticDir, "index.html"))
		})
	}

	api := r.Group("/api")
	{
		// Sizes
		api.GET("/sizes", handlers.HandleSizes)

		// Layouts
		api.GET("/layouts", handlers.ListLayouts)
		api.POST("/layouts", handlers.CreateLayout)
		api.GET("/layouts/:id", handlers.GetLayout)
		api.PUT("/layouts/:id", handlers.UpdateLayout)
		api.DELETE("/layouts/:id", handlers.DeleteLayout)

		// Brands
		api.GET("/brands", handlers.ListBrands)
		api.POST("/brands", handlers.CreateBrand)
		api.GET("/brands/:id", handlers.GetBrand)
		api.PUT("/brands/:id", handlers.UpdateBrand)
		api.DELETE("/brands/:id", handlers.DeleteBrand)

		// Brand assets
		api.POST("/brands/:id/assets/logos", handlers.UploadLogo)
		api.DELETE("/brands/:id/assets/logos/:logoId", handlers.DeleteLogo)
		api.POST("/brands/:id/assets/backgrounds", handlers.UploadBackground)
		api.DELETE("/brands/:id/assets/backgrounds/:bgName", handlers.DeleteBackground)
		api.POST("/brands/:id/assets/watermark", handlers.UploadWatermark)

		// Templates
		api.GET("/templates", handlers.ListTemplates)
		api.POST("/templates", handlers.CreateTemplate)
		api.GET("/templates/:id", handlers.GetTemplate)
		api.PUT("/templates/:id", handlers.UpdateTemplate)
		api.DELETE("/templates/:id", handlers.DeleteTemplate)

		// Designs
		api.POST("/designs", handlers.CreateDesign)
		api.GET("/designs/:id", handlers.GetDesign)
		api.PUT("/designs/:id", handlers.UpdateDesign)
		api.POST("/designs/:id/fork", handlers.ForkDesign)

		// Render
		api.GET("/render", handlers.HandleRender)
		api.GET("/render/html", handlers.HandleRenderHTML)

		// Bulk render
		api.POST("/bulk/render", handlers.HandleBulkRender)

		// Media
		api.GET("/media", handlers.ListMedia)
		api.POST("/media", handlers.CreateMedia)
		api.GET("/media/:id", handlers.GetMedia)
		api.DELETE("/media/:id", handlers.DeleteMedia)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("SnapKit server starting on :%s", port)
	r.Run(":" + port)
}
