                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="resources" className="flex-1 overflow-y-auto p-3">
              {loadingResources ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : resourcesError ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-md">
                  {resourcesError}
                </div>
              ) : resources.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <FileDown className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                  <div>
                    <p className="text-muted-foreground font-medium">No resources available</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">This lecture doesn't have any downloadable resources.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground px-1 mb-2">Downloadable Materials</h3>
                  
                  {getFormattedResources().map((resource, idx) => (
                    <Card key={idx} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="p-3 flex items-center justify-between hover:bg-muted/40 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
                              {resource.icon}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{resource.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {resource.size}
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            asChild={!!resource.url}
                          >
                            {resource.url ? (
                              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            ) : (
                              <span><Download className="h-4 w-4" /></span>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="mt-4 pt-4 border-t">
                    <h3 className="text-sm font-medium text-muted-foreground px-1 mb-3">Additional Resources</h3>
                    <Card className="overflow-hidden">
                      <CardContent className="p-3">
                        <ul className="space-y-2">
                          <li>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-muted-foreground hover:text-foreground"
                              onClick={() => setActiveTab('transcript')}
                            >
                              <FileText className="h-4 w-4 mr-2 text-primary" />
                              View Full Transcript
                            </Button>
                          </li>
                          <li>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-muted-foreground hover:text-foreground"
                              disabled={isCompleted}
                              onClick={completeManually}
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                              Mark as Completed
                            </Button>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Mobile navigation footer */}
      <div className="block md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-2 z-20">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={navigatePrevious}
            disabled={!hasPrevious}
            className="flex-1"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.push(`/chapters/${lecture.chapterId}`)}
            className="mx-1"
            size="sm"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            onClick={navigateToNext}
            disabled={!hasNext}
            className="flex-1"
            size="sm"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      {/* Overlay when mobile sidebar is open */}
      {(isMobile && (isLeftMenuOpen || isRightMenuOpen)) && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-10"
          onClick={() => {
            setIsLeftMenuOpen(false);
            setIsRightMenuOpen(false);
          }}
        />
      )}
    </div>
  );
}