import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_DEFAULT_KEY, SUPABASE_URL } from "../config";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_DEFAULT_KEY);

export default supabase;
