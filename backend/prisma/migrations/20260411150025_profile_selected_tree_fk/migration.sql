-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_selectedTreeType_fkey" FOREIGN KEY ("selectedTreeType") REFERENCES "TreeType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
