// ── Fill these in with your own free Supabase project details ──
// See README.md for step-by-step setup (it takes about 5 minutes and costs $0).
window.WALL_CONFIG = {
  SUPABASE_URL: "https://sldboznkpmmxbngoagcy.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsZGJvem5rcG1teGJuZ29hZ2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MTQ0MjEsImV4cCI6MjA5ODQ5MDQyMX0.aQaoPQTI-B4bcALQuuKB-FGxpcBEQdLYDDiaw5Kt1LU",
  TABLE: "illustrations",
  BUCKET: "illustrations",



  // Layout of the wall — change these to resize the "plots" people draw into.
  CELL_SIZE: 260,        // world-pixels per grid cell (includes margin)
  CARD_SIZE: 210,        // the drawing's rendered size inside its cell
  CENTER_RESERVED_RINGS: 1, // how many rings of cells around (0,0) are reserved for the center illustration (1 = a 3x3 block)
  CENTER_IMAGE_SIZE: 3,  // how many cells wide/tall the center image bounding box is (should be 2*RINGS+1)

    // so name the files after their artist/creator, e.g. "jane_doe.png".
    CENTER_ART_MANIFEST: "assets/thewallart/manifest.json",
 
    // Voting. LIKE_HIGHLIGHT_THRESHOLD is purely cosmetic (client-side).
    // DISLIKE_ARCHIVE_THRESHOLD is for display only — the real enforcement
    // is the `dislike_archive_threshold` constant inside rpc_vote() in
    // supabase-schema.sql. Keep the two numbers in sync by hand.
    LIKE_HIGHLIGHT_THRESHOLD: 5,
    DISLIKE_ARCHIVE_THRESHOLD: 5,
  
};
