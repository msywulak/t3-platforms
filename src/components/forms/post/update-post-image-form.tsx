"use client";

import * as React from "react";
import Image from "next/image";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type FileWithPreview } from "@/types";
import {
  Form,
  FormControl,
  FormItem,
  UncontrolledFormMessage,
} from "@/components/ui/form";
import { Icons } from "@/components/icons";
import { Zoom } from "@/components/zoom-image";
import { FileDialog } from "@/components/file-dialog";
import { Button } from "@/components/ui/button";
import { isArrayOfFile } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import { type Post } from "@/db/schema";
import { AppearanceCard } from "@/components/appearance-card";
import { updatePostSchema } from "@/lib/validations/post";
import { updatePostImage } from "@/lib/actions";

interface UpdatePostImageFormProps
  extends React.HTMLAttributes<HTMLDivElement> {
  post: Pick<Post, "id" | "title" | "image">;
}

type Inputs = z.infer<typeof updatePostSchema>;

export function UpdatePostImageForm({ post }: UpdatePostImageFormProps) {
  const [image, setImage] = React.useState<FileWithPreview[] | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const { isUploading, startUpload } = useUploadThing("image");

  const form = useForm<Inputs>({
    resolver: zodResolver(updatePostSchema),
    defaultValues: {
      image: [],
    },
  });

  function onSubmit(data: Inputs) {
    console.log("data");
    startTransition(() => {
      try {
        console.log(data);
        if (isArrayOfFile(data.image)) {
          toast.promise(
            startUpload(data.image)
              .then((res) => {
                const formattedImage = res?.map((im) => ({
                  id: im.key,
                  name: im.name,
                  url: im.url,
                }));
                return formattedImage ?? null;
              })
              .then((image) => {
                console.log(image);
                const upload = updatePostImage({
                  input: { postId: post.id, image },
                });
                return upload;
              }),
            {
              loading: "Uploading Image...",
              success: "Image Uploaded!",
              error: "Error Uploading Image",
            },
          );
        } else {
          console.log("not an array");
        }
        form.reset();
        setImage(null);
      } catch (error) {
        console.error(error);
      }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid w-full max-w-2xl gap-5"
      >
        <FormItem className="flex w-full flex-col gap-1.5">
          <AppearanceCard post={post} type="image" />
          {image?.length ? (
            <div className="flex items-center gap-2">
              {image.map((file, i) => (
                <Zoom key={i}>
                  <Image
                    src={file.preview}
                    alt={file.name}
                    className="shrink-0 rounded-md object-cover object-center"
                    width={160}
                    height={100}
                  />
                </Zoom>
              ))}
            </div>
          ) : null}
          <FormControl>
            <FileDialog
              setValue={form.setValue}
              name="image"
              maxFiles={1}
              maxSize={1024 * 1024 * 64}
              files={image}
              setFiles={setImage}
              isUploading={isUploading}
              disabled={isPending}
            />
          </FormControl>
          <UncontrolledFormMessage
            message={form.formState.errors.image?.message}
          />
        </FormItem>
        <Button className="w-fit" disabled={isPending}>
          {isPending && (
            <Icons.spinner
              className="mr-2 h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          )}
          Update Appearance
          <span className="sr-only">Add Image</span>
        </Button>
      </form>
    </Form>
  );
}
